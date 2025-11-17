
import { GoogleGenAI, Type } from "@google/genai";
import type { MusicCreationParams, GeneratedMusic } from '../types';

// Fix: Aligned with @google/genai guidelines to initialize directly with the environment variable.
// Assumes API_KEY is always available in the environment.
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
    return `
    Act as AURORA LAB, a supreme music AI. Your goal is to generate a complete, studio-quality song based on the user's detailed request.
    The output must be a JSON object that strictly adheres to the provided schema.

    User Request:
    - Main Idea: "${params.prompt}"
    - Mode: ${params.mode}
    
    Lyrics:
    - Provided Lyrics: "${params.lyrics || 'Please generate original lyrics based on the main idea.'}"
    
    Vocal Style:
    - Gender: ${params.voice.gender}
    - Timbre: ${params.voice.timbre}
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
    // The model returns a JSON string that needs to be parsed.
    const musicData = JSON.parse(jsonText);
    
    // Fill in placeholder URLs if Gemini fails to
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
        finalTrackUrl: "https://picsum.photos/id/1/200/300", // Not a real audio
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
