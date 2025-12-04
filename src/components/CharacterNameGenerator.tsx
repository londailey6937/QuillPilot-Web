import React, { useState } from "react";
import { creamPalette as palette } from "../styles/palette";

interface CharacterNameGeneratorProps {
  onClose: () => void;
  onOpenHelp?: () => void;
}

interface NameOption {
  first: string;
  last: string;
  meaning: string;
  origin: string;
}

export const CharacterNameGenerator: React.FC<CharacterNameGeneratorProps> = ({
  onClose,
  onOpenHelp,
}) => {
  const [genre, setGenre] = useState<string>("fantasy");
  const [culture, setCulture] = useState<string>("english");
  const [timePeriod, setTimePeriod] = useState<string>("modern");
  const [gender, setGender] = useState<string>("any");
  const [generatedNames, setGeneratedNames] = useState<NameOption[]>([]);
  const [savedNames, setSavedNames] = useState<NameOption[]>([]);

  const nameDatabase = {
    fantasy: {
      english: {
        modern: {
          male: [
            {
              first: "Aldric",
              last: "Blackwood",
              meaning: "wise ruler",
              origin: "Old English",
            },
            {
              first: "Theron",
              last: "Ashford",
              meaning: "hunter",
              origin: "Greek",
            },
            {
              first: "Caelum",
              last: "Stormrider",
              meaning: "heaven",
              origin: "Latin",
            },
          ],
          female: [
            {
              first: "Elara",
              last: "Moonwhisper",
              meaning: "bright star",
              origin: "Greek",
            },
            {
              first: "Lyanna",
              last: "Thornwood",
              meaning: "light",
              origin: "Celtic",
            },
            {
              first: "Seraphina",
              last: "Nightshade",
              meaning: "fiery one",
              origin: "Hebrew",
            },
          ],
        },
      },
    },
    historical: {
      english: {
        victorian: {
          male: [
            {
              first: "Edmund",
              last: "Fitzwilliam",
              meaning: "fortunate protector",
              origin: "Old English",
            },
            {
              first: "Charles",
              last: "Pemberton",
              meaning: "free man",
              origin: "Germanic",
            },
            {
              first: "Oliver",
              last: "Ashworth",
              meaning: "olive tree",
              origin: "Latin",
            },
          ],
          female: [
            {
              first: "Eleanor",
              last: "Dashwood",
              meaning: "shining light",
              origin: "Greek",
            },
            {
              first: "Charlotte",
              last: "Thornbury",
              meaning: "free woman",
              origin: "French",
            },
            {
              first: "Beatrice",
              last: "Huntington",
              meaning: "bringer of joy",
              origin: "Latin",
            },
          ],
        },
      },
    },
    contemporary: {
      american: {
        modern: {
          male: [
            {
              first: "Jackson",
              last: "Rivers",
              meaning: "son of Jack",
              origin: "English",
            },
            {
              first: "Mason",
              last: "Harper",
              meaning: "stone worker",
              origin: "French",
            },
            {
              first: "Carter",
              last: "Blake",
              meaning: "transporter",
              origin: "English",
            },
          ],
          female: [
            {
              first: "Harper",
              last: "Martinez",
              meaning: "harp player",
              origin: "English",
            },
            {
              first: "Avery",
              last: "Chen",
              meaning: "ruler of elves",
              origin: "English",
            },
            {
              first: "Riley",
              last: "Anderson",
              meaning: "valiant",
              origin: "Irish",
            },
          ],
        },
      },
    },
    scifi: {
      futuristic: {
        modern: {
          male: [
            {
              first: "Zane",
              last: "Vex",
              meaning: "God's gracious gift",
              origin: "Hebrew",
            },
            {
              first: "Kael",
              last: "Soren",
              meaning: "mighty warrior",
              origin: "Gaelic",
            },
            {
              first: "Ryker",
              last: "Nova",
              meaning: "strong power",
              origin: "Dutch",
            },
          ],
          female: [
            { first: "Nova", last: "Orion", meaning: "new", origin: "Latin" },
            { first: "Lyra", last: "Vega", meaning: "lyre", origin: "Greek" },
            {
              first: "Aria",
              last: "Stellaris",
              meaning: "air",
              origin: "Italian",
            },
          ],
        },
      },
    },
  };

  const generateNames = () => {
    const names: NameOption[] = [];
    const targetGender = gender === "any" ? ["male", "female"] : [gender];

    // Get names from database based on selections
    const genreData = nameDatabase[genre as keyof typeof nameDatabase];
    if (genreData) {
      const cultureData = genreData[culture as keyof typeof genreData];
      if (cultureData) {
        const periodData = cultureData[timePeriod as keyof typeof cultureData];
        if (periodData) {
          targetGender.forEach((g) => {
            const genderNames = periodData[g as keyof typeof periodData] as
              | NameOption[]
              | undefined;
            if (genderNames && Array.isArray(genderNames)) {
              names.push(...genderNames);
            }
          });
        }
      }
    }

    // Shuffle and take 6 random names
    const shuffled = names.sort(() => Math.random() - 0.5);
    setGeneratedNames(shuffled.slice(0, 6));
  };

  const saveName = (name: NameOption) => {
    if (
      !savedNames.find((n) => n.first === name.first && n.last === name.last)
    ) {
      setSavedNames([...savedNames, name]);
    }
  };

  const removeSavedName = (name: NameOption) => {
    setSavedNames(
      savedNames.filter((n) => n.first !== name.first || n.last !== name.last)
    );
  };

  return (
    <div
      className="character-name-generator-modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: palette.base,
        border: `2px solid ${palette.border}`,
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        maxWidth: "900px",
        maxHeight: "85vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <div className="mb-4 flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-black">
          🎭 Character Name Generator
        </h2>
        <button
          onClick={() => onOpenHelp?.()}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: palette.mutedText,
            padding: "4px 8px",
          }}
          title="Help"
        >
          ?
        </button>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div
          className="border rounded-lg p-4"
          style={{
            background: palette.subtle,
            borderColor: palette.border,
          }}
        >
          <h3 className="font-bold text-lg mb-3 text-black">Customize Names</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: palette.navy }}
              >
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              >
                <option value="fantasy">Fantasy</option>
                <option value="historical">Historical</option>
                <option value="contemporary">Contemporary</option>
                <option value="scifi">Sci-Fi</option>
              </select>
            </div>

            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: palette.navy }}
              >
                Culture/Origin
              </label>
              <select
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              >
                <option value="english">English</option>
                <option value="american">American</option>
                <option value="futuristic">Futuristic</option>
              </select>
            </div>

            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: palette.navy }}
              >
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              >
                <option value="modern">Modern</option>
                <option value="victorian">Victorian</option>
                <option value="medieval">Medieval</option>
              </select>
            </div>

            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: palette.navy }}
              >
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  background: palette.base,
                  borderColor: palette.border,
                  color: palette.navy,
                }}
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateNames}
            className="w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              background: palette.accent,
              color: "#ffffff",
              border: `1px solid ${palette.accent}`,
            }}
          >
            Generate Names
          </button>
        </div>

        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.base,
              borderColor: palette.border,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              Generated Names
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {generatedNames.map((name, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3"
                  style={{
                    background: palette.subtle,
                    borderColor: palette.lightBorder,
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="font-bold text-lg"
                      style={{ color: palette.navy }}
                    >
                      {name.first} {name.last}
                    </div>
                    <button
                      onClick={() => saveName(name)}
                      className="text-xl"
                      title="Save name"
                    >
                      ⭐
                    </button>
                  </div>
                  <div className="text-sm" style={{ color: palette.mutedText }}>
                    <div>Meaning: {name.meaning}</div>
                    <div>Origin: {name.origin}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Names */}
        {savedNames.length > 0 && (
          <div
            className="border rounded-lg p-4"
            style={{
              background: palette.light,
              borderColor: palette.lightBorder,
            }}
          >
            <h3 className="font-bold text-lg mb-3 text-black">
              ⭐ Saved Names ({savedNames.length})
            </h3>
            <div className="space-y-2">
              {savedNames.map((name, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 rounded border"
                  style={{
                    background: palette.base,
                    borderColor: palette.border,
                  }}
                >
                  <div>
                    <div className="font-bold" style={{ color: palette.navy }}>
                      {name.first} {name.last}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: palette.mutedText }}
                    >
                      {name.meaning} • {name.origin}
                    </div>
                  </div>
                  <button
                    onClick={() => removeSavedName(name)}
                    className="text-red-500 text-xl"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
