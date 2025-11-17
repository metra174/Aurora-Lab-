
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { MusicCreationParams, GeneratedMusic } from '../types';
import { CreationMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A cool, catchy title for the song.' },
    finalTrackUrl: { type: Type.STRING, description: 'A placeholder URL for the final high-quality audio file.' },
    lyrics: { type: Type.STRING, description: 'The complete lyrics for the song, formatted with verses and chorus.' },
    stems: {
      type: Type.ARRAY,
      description: 'An array of individual instrument and vocal tracks (stems).',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'The name of the stem (e.g., "Vocal (Clean)", "Kick", "Bass").' },
          url: { type: Type.STRING, description: 'A placeholder URL for the stem audio file.' },
        },
        required: ['name', 'url'],
      },
    },
    waveform: {
      type: Type.ARRAY,
      description: 'An array of 100 numbers between 0 and 1 representing the song\'s amplitude waveform for visualization.',
      items: { type: Type.NUMBER },
    },
    arrangement: { type: Type.STRING, description: 'A description of the song structure (e.g., Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Outro).' },
    bandlabUrl: { type: Type.STRING, description: 'A placeholder URL to a downloadable BandLab project file.' },
    alternativeVersions: {
        type: Type.ARRAY,
        description: 'An array of alternative versions of the song.',
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'Name of the version (e.g., "Radio Edit", "Extended Mix").' },
                url: { type: Type.STRING, description: 'A placeholder URL for the alternative version audio file.' },
            },
            required: ['name', 'url'],
        }
    }
  },
  required: ['title', 'finalTrackUrl', 'lyrics', 'stems', 'waveform', 'arrangement', 'bandlabUrl', 'alternativeVersions'],
};

function buildPrompt(params: MusicCreationParams): string {
    const vocalClonePrompt = params.mode === CreationMode.VocalClone && params.vocalSample
        ? `
    Vocal Clone Mode Activated:
    - A vocal sample file named "${params.vocalSample.name}" has been provided by the user.
    - Your task is to act as if you have analyzed this sample using "Neural Singing Voice Synthesis" technology.
    - Extract the unique timbre, pitch, breathing patterns, and vocal characteristics from the provided sample.
    - Generate the lead vocal for this song using a neural voice model cloned from this sample. The generated voice should sound exactly like the user's sample but singing the new lyrics with the specified emotion and autotune.
    - The standard 'Gender' and 'Timbre' settings are overridden by this sample. Use the sample's characteristics instead. The voice must sound hyper-realistic and human, with natural breathing and dynamics, not robotic.
    `
        : '';

    return `
    Act as AURORA LAB, a supreme music AI. Your goal is to generate a complete, studio-quality song based on the user's detailed request.
    The output must be a JSON object that strictly adheres to the provided schema.

    User Request:
    - Main Idea: "${params.prompt}"
    - Mode: ${params.mode}
    ${vocalClonePrompt}
    
    Lyrics:
    - Provided Lyrics: "${params.lyrics || 'Please generate original lyrics based on the main idea.'}"
    
    Vocal Style:
    - Gender: ${params.voice.gender} ${params.mode === CreationMode.VocalClone ? '(Overridden by sample)' : ''}
    - Timbre: ${params.voice.timbre} ${params.mode === CreationMode.VocalClone ? '(Overridden by sample)' : ''}
    - Emotion: ${params.voice.emotion}
    - Autotune: ${params.voice.autotune}

    Beat & Instrumental Style:
    - Genre: ${params.beat.style}
    - Atmosphere: ${params.pro.atmosphere}
    
    Professional Controls:
    - BPM: ${params.pro.bpm}
    - Key: ${params.pro.key}
    - Harmony: ${params.pro.harmony}
    - Intensity: ${params.pro.intensity}/100

    Your task is to generate the metadata for this song. Create a compelling song title, write professional lyrics if none were provided, and structure the output perfectly.
    The URLs should be placeholders like 'https://auroralab.dev/audio/placeholder.wav'.
    The waveform data should be an array of 100 random-looking but smooth numbers between 0.1 and 0.9.
    `;
}

// Helper function to decode base64 string to Uint8Array
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts raw PCM audio data to a WAV audio blob.
 * The Gemini TTS model returns 16-bit, 24kHz, single-channel PCM.
 */
function pcmToWavBlob(pcmData: Uint8Array): Blob {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // (file size) - 8
  writeString(view, 8, 'WAVE');

  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true); // AudioFormat for PCM (1)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // DATA sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data from the Uint8Array
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([view], { type: 'audio/wav' });
}


export const generateMusic = async (params: MusicCreationParams): Promise<GeneratedMusic> => {
  try {
    const prompt = buildPrompt(params);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const musicData: GeneratedMusic = JSON.parse(jsonText);
    
    // Generate actual audio for the vocals if lyrics are available
    if (musicData.lyrics && musicData.lyrics.trim().length > 0) {
      const ttsPrompt = `Say cheerfully, with a ${params.voice.emotion.toLowerCase()} tone: ${musicData.lyrics}`;
      
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: ttsPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const pcmData = base64ToUint8Array(base64Audio);
        const wavBlob = pcmToWavBlob(pcmData);
        const audioUrl = URL.createObjectURL(wavBlob);
        musicData.finalTrackUrl = audioUrl; // Replace placeholder with real audio URL
      }
    }
    
    // Fill in placeholder URLs if audio generation fails or wasn't possible
    musicData.finalTrackUrl = musicData.finalTrackUrl || 'https://auroralab.dev/audio/placeholder.mp3';
    musicData.bandlabUrl = musicData.bandlabUrl || 'https://auroralab.dev/project/placeholder.zip';
    musicData.stems = musicData.stems.map((stem: any) => ({ ...stem, url: stem.url || 'https://auroralab.dev/audio/stem_placeholder.wav' }));
    
    return musicData;

  } catch (error) {
    console.error("Error generating music with Gemini:", error);
    // Fallback to mock data on API error
    return generateMockMusic(params);
  }
};


const generateMockMusic = (params: MusicCreationParams): GeneratedMusic => {
    console.log("Gemini call failed. Generating mock data.");
    return {
        title: `Mock: ${params.prompt.substring(0, 20)}`,
        finalTrackUrl: "",
        lyrics: params.lyrics || `This is a mock-generated lyric for the prompt "${params.prompt}".\n\n[Verse 1]\nIn a world of code and dreams,\nNothing is quite what it seems.\n\n[Chorus]\nOh, Aurora, sing for me,\nA digital reality.`,
        stems: [
            { name: "Vocal (Clean)", url: "#" },
            { name: "Beat Complete", url: "#" },
            { name: "Kick", url: "#" },
            { name: "Snare", url: "#" },
            { name: "Bass", url: "#" },
            { name: "Piano", url: "#" },
        ],
        waveform: Array.from({ length: 100 }, () => 0.1 + Math.random() * 0.8),
        arrangement: "Intro, Verse, Chorus, Verse, Chorus, Bridge, Outro",
        bandlabUrl: "#",
        alternativeVersions: [
            { name: "Radio Edit", url: "#" },
            { name: "Instrumental", url: "#" }
        ],
    };
};
