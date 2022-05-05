import { useEffect, useRef } from "react";
import { Box, SliderProvider, Stack } from "@chakra-ui/react";
import abcjs from "abcjs";
import { nanoid } from "nanoid";
import "abcjs/abcjs-audio.css";

// play sounds
import useSound from "use-sound";
import { ExposedData, PlayFunction } from "use-sound/dist/types";

// Gangsa
import Gangsa1 from "./Gamelan/Gangsa/Gangsa1.mp4";
import Gangsa2 from "./Gamelan/Gangsa/Gangsa2.mp4";
import Gangsa3 from "./Gamelan/Gangsa/Gangsa3.mp4";
import Gangsa4 from "./Gamelan/Gangsa/Gangsa4.mp4";
import Gangsa5 from "./Gamelan/Gangsa/Gangsa5.mp4";
import Gangsa6 from "./Gamelan/Gangsa/Gangsa6.mp4";
import Gangsa7 from "./Gamelan/Gangsa/Gangsa7.mp4";
import Gangsa8 from "./Gamelan/Gangsa/Gangsa8.mp4";
import Gangsa9 from "./Gamelan/Gangsa/Gangsa9.mp4";
import Gangsa10 from "./Gamelan/Gangsa/Gangsa10.mp4";

// Jegogan
import Jegogan1 from "./Gamelan/Jegogan/Jegogan1.mp4";
import Jegogan2 from "./Gamelan/Jegogan/Jegogan2.mp4";
import Jegogan3 from "./Gamelan/Jegogan/Jegogan3.mp4";
import Jegogan4 from "./Gamelan/Jegogan/Jegogan4.mp4";
import Jegogan5 from "./Gamelan/Jegogan/Jegogan5.mp4";

// Ugal
import Ugal1 from "./Gamelan/Ugal/Ugal1.mp4";
import Ugal2 from "./Gamelan/Ugal/Ugal2.mp4";
import Ugal3 from "./Gamelan/Ugal/Ugal3.mp4";
import Ugal4 from "./Gamelan/Ugal/Ugal4.mp4";
import Ugal5 from "./Gamelan/Ugal/Ugal5.mp4";
import Ugal6 from "./Gamelan/Ugal/Ugal6.mp4";
import Ugal7 from "./Gamelan/Ugal/Ugal7.mp4";
import Ugal8 from "./Gamelan/Ugal/Ugal8.mp4";
import Ugal9 from "./Gamelan/Ugal/Ugal9.mp4";
import Ugal10 from "./Gamelan/Ugal/Ugal10.mp4";

// Gong
import Gong from "./Gamelan/Gong.mp4";

type ScoreProps = {
  notes: string;
  darkMode: boolean;
};

type InstrumentPlayer = {
  [id: number]: {
    [note: number]: { play: PlayFunction; stop: ExposedData["stop"] };
  };
};

type InternalNotes = {
  [id: number]: { [note: string]: number };
};

type NoteOptions = {
  Gangsa: string[];
  Jegogan: string[];
  Ugal: string[];
  Gong: string[];
};

const gangsaId: number = 0;
const jegoganId: number = 1;
const ugalId: number = 2;
const miscId: number = 3;

const instrumentNotes = {
  [gangsaId]: [
    Gangsa1,
    Gangsa2,
    Gangsa3,
    Gangsa4,
    Gangsa5,
    Gangsa6,
    Gangsa7,
    Gangsa8,
    Gangsa9,
    Gangsa10,
  ],
  [jegoganId]: [Jegogan1, Jegogan2, Jegogan3, Jegogan4, Jegogan5],
  [ugalId]: [
    Ugal1,
    Ugal2,
    Ugal3,
    Ugal4,
    Ugal5,
    Ugal6,
    Ugal7,
    Ugal8,
    Ugal9,
    Ugal10,
  ],
  [miscId]: [Gong],
};

type InternalNotesToBaliNotes = {
  [id: number]: { [note: number]: string };
};
const internalNoteToBaliNote: InternalNotesToBaliNotes = {
  [gangsaId]: {
    [0]: "1*",
    [1]: "6*",
    [2]: "5*",
    [3]: "3*",
    [4]: "2*",
    [5]: "1",
    [6]: "6",
    [7]: "5",
    [8]: "3",
    [9]: "2",
    [10]: "G",
    [11]: "-",
  },
  [jegoganId]: {
    [0]: "1",
    [1]: "6",
    [2]: "5",
    [3]: "3",
    [4]: "2",
    [10]: "G",
    [11]: "-",
  },
  [ugalId]: {
    [0]: "1*",
    [1]: "6*",
    [2]: "5*",
    [3]: "3*",
    [4]: "2*",
    [5]: "1",
    [6]: "6",
    [7]: "5",
    [8]: "3",
    [9]: "2",
    [10]: "G",
    [11]: "-",
  },
};

const idToInstrument = {
  [gangsaId]: "Gangsa",
  [jegoganId]: "Jegogan",
  [ugalId]: "Ugal",
};

// returns a list of numbers 0-9 that should be played
function parseNotes(notes: string) {
  const pattern = new RegExp("\\s");
  let splitNotes = notes.split(pattern);
  splitNotes = splitNotes.filter((note) => note !== ""); // remove whitespace

  const noteOptions: NoteOptions = {
    Gangsa: ["1*", "6*", "5*", "3*", "2*", "1", "6", "5", "3", "2"],
    Jegogan: ["1", "6", "5", "3", "2"],
    Ugal: ["1*", "6*", "5*", "3*", "2*", "1", "6", "5", "3", "2"],
    Gong: ["G"],
  };

  const possibleNotes: string[] = [
    "1*",
    "6*",
    "5*",
    "3*",
    "2*",
    "1",
    "6",
    "5",
    "3",
    "2",
    "G",
    "-",
  ];

  let noteToInternalRep: InternalNotes = {
    [gangsaId]: {},
    [jegoganId]: {},
    [ugalId]: {},
  };

  // create a mapping for each of the string representations of notes to numbers
  noteOptions.Gangsa.forEach(
    (note, i) => (noteToInternalRep[gangsaId][note] = i)
  );
  noteOptions.Jegogan.forEach(
    (note, i) => (noteToInternalRep[jegoganId][note] = i)
  );
  noteOptions.Ugal.forEach((note, i) => (noteToInternalRep[ugalId][note] = i));

  let resultingNotes: number[][] = [[gangsaId]];
  splitNotes.forEach((note) => {
    if (note != undefined) {
      resultingNotes[0].push(noteToInternalRep[gangsaId][note]);
    }
  });

  let splitNotesByInstrument: number[][] = [];
  let lastInstrumentId: number = gangsaId;
  splitNotes.forEach((note) => {
    if (note === "g") {
      lastInstrumentId = gangsaId;
      splitNotesByInstrument.push([gangsaId]);
    } else if (note === "u") {
      lastInstrumentId = ugalId;
      splitNotesByInstrument.push([ugalId]);
    } else if (note === "j") {
      lastInstrumentId = jegoganId;
      splitNotesByInstrument.push([jegoganId]);
    } else {
      if (possibleNotes.includes(note) && splitNotesByInstrument.length > 0) {
        if (note == "G") {
          splitNotesByInstrument[splitNotesByInstrument.length - 1].push(10);
        } else if (note == "-") {
          splitNotesByInstrument[splitNotesByInstrument.length - 1].push(11);
        } else {
          splitNotesByInstrument[splitNotesByInstrument.length - 1].push(
            noteToInternalRep[lastInstrumentId][note]
          );
        }
      }
    }
  });

  return splitNotesByInstrument;
}

function NewScore({ notes, darkMode }: ScoreProps) {
  const beatsPerSecond: number = 1;
  const playTheseNotes: number[][] = parseNotes(notes);
  console.log(playTheseNotes);

  let instrumentPlayer: InstrumentPlayer = {
    [gangsaId]: {},
    [jegoganId]: {},
    [ugalId]: {},
    [miscId]: {},
  };

  // load every objects sound into the music player
  Object.entries(instrumentNotes).forEach(
    ([instrument, notes], instrumentIndex) => {
      // load the notes for the given instrument into sound player
      notes.forEach((note: string, i: number) => {
        const [play, { stop }] = useSound<PlayFunction>(note); // load the note
        instrumentPlayer[instrumentIndex][i] = {
          play: () => play(),
          stop: () => stop(),
        }; // add to gangsa player object
      });
    }
  );

  // play the note for duration number of milliseconds
  function playInstrumentNote(
    instrumentId: number,
    note: number,
    duration: number
  ) {
    if (note === 10) {
      let gongDuration: number = 2000;
      instrumentPlayer[miscId][0].play();
      setTimeout(() => {
        instrumentPlayer[miscId][0].stop();
      }, gongDuration);
    } else if (note === 11) {
      setTimeout(() => {}, duration);
    } else {
      instrumentPlayer[instrumentId][note].play();
      setTimeout(() => {
        instrumentPlayer[instrumentId][note].stop();
      }, duration);
    }
  }

  const duration: number = 500;

  let notesMenu: any = [];

  let baliNotes: string[][] = [];
  playTheseNotes.forEach((notes) => {
    baliNotes.push([]);
  }); // initialize to have as many empty lists as needed

  // convert from internal representation to bali notes for frontend
  playTheseNotes.forEach((notes, i) => {
    const instrumentId: number = notes[0];
    const instrument: string = idToInstrument[instrumentId];

    // add the instrument identifier at the beginning
    baliNotes[i].push(instrument);
    notes.forEach((note, j) => {
      if (j != 0) {
        // skip over the instrument identifier
        let baliNote = internalNoteToBaliNote[instrumentId][note];
        baliNotes[i].push(baliNote);
      }
    });
  });

  return (
    <Stack p={3}>
      {baliNotes.forEach((notes) => {
        // render the notes on screen
        notesMenu.push(
          <p>
            {notes[0]}: {notes.slice(1, notes.length)}
          </p>
        );
      })}

      <div>{notesMenu}</div>

      <button
        onClick={() => {
          // play the notes on a schedule

          playTheseNotes.forEach((notes, j) => {
            let i: number = 0;
            let instrumentId: number;

            setTimeout(function run() {
              if (i === 0) {
                // first note of the sublist indicates the instrument being played
                instrumentId = notes[i];
              } else {
                // play the notes for the instrument
                if (notes[i] != undefined) {
                  // don't play the note if its undefined
                  playInstrumentNote(instrumentId, notes[i], duration);
                }
              }

              if (i < notes.length - 1) {
                // if theres more notes play them
                setTimeout(run, duration);
              }
              i++; // next note
            }, duration);
          });
        }}
      >
        Play Gamelan
      </button>
    </Stack>
  );
}

export default NewScore;
