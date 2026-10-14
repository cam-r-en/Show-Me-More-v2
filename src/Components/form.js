const FORM_OPTIONS = [
  {
    //MUSIC CATEGORY
    value: "Music",
    label: "Music",
    subOptions: [
      {
        //M-GENRES SUBCATEGORY
        value: "genre",
        label: "Genre",
        fields: [
          {
            id: "genreTitles",
            label: "What genres are you looking for?",
            type: "checkbox",
            options: [
              "Hip Hop",
              "Rock",
              "Pop",
              "Jazz",
              "Metal",
              "Country",
              "R&B",
              "Blues",
            ],
          },
        ],
      },
      {
        //M-ALBUMS SUBCATEGORY
        value: "albums",
        label: "Albums",
        fields: [
          {
            id: "eitherOr",
            label: "Are you looking for a similar album or something new?",
            type: "radio",
            options: ["Similar Albums", "Something New"],
            subfields: {
              "Similar Albums": [
                {
                  id: "length",
                  label: "How long should the album be?",
                  type: "checkbox",
                  options: ["5-10 Songs", "12-20 Songs", "Doesn't Matter"],
                },
                {
                  id: "similarTo",
                  label: "What're we looking for?",
                  type: "text",
                },
              ],
              "Something New": [
                {
                  id: "genreTitles",
                  label: "What genres are you looking for?",
                  type: "checkbox",
                  options: [
                    "Hip-Hop",
                    "Rock",
                    "Pop",
                    "Jazz",
                    "Metal",
                    "Country",
                    "R&B",
                    "Blues",
                  ],
                },
                {
                  id: "length",
                  label: "How long should the album be?",
                  type: "checkbox",
                  options: ["5-10 Songs", "12-20 Songs", "Doesn't Matter"],
                },
              ],
            },
          },
        ],
      },
      {
        //M-ARTISTS SUBCATEGORY
        value: "artists",
        label: "Artists",
        fields: [
          {
            id: "eitherOr",
            label: "Are you looking for a similar artists or something new?",
            type: "radio",
            options: ["Similar Artists", "Something New"],
            subfields: {
              "Similar Artists": [
                {
                  id: "similarTo",
                  label: "Who're we looking for?",
                  type: "text",
                },
              ],
              "Something New": [
                {
                  id: "genreTitles",
                  label: "What genres are you looking for?",
                  type: "checkbox",
                  options: [
                    "Hip-Hop",
                    "Rock",
                    "Pop",
                    "Jazz",
                    "Metal",
                    "Country",
                    "R&B",
                    "Blues",
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    value: "Games",
    label: "Games",
    subOptions: [
      {
        value: "genre",
        label: "Genre",
        fields: [
          {
            id: "favoriteGenres",
            label: "What's some of your favorite genres?",
            type: "checkbox",
            options: [
              "Action",
              "Adventure",
              "Shooter",
              "Fighting",
              "Strategy",
              "Puzzle",
              "Simulation",
              "Platformer",
              "Racing",
              "Sports",
              "RPG",
            ],
          },
          {
            id: "preferrableConsole",
            label: "What console(s) do you play on?",
            type: "checkbox",
            options: [
              "Playstation",
              "Xbox",
              "Nintendo",
              "PC",
              "iOS",
              "Android",
              "Any",
            ],
          },
          {
            id: "preferrableDevelopers",
            label: "Any specific developers?",
            type: "checkbox",
            options: [
              "Activision",
              "Insomniac",
              "Valve",
              "Ubisoft",
              "Square Enix",
              "Capcom",
              "Sega",
              "EA",
              "Nintendo",
              "Telltale",
              "Naughty Dog",
              "Treyarch",
              "2K",
              "Rockstar",
              "Any",
            ],
          },
          {
            id: "ageRating",
            label: "What age range do you want to stay in?",
            type: "checkbox",
            options: [
              "E (Everyone)",
              "E10+ (Everyone 10+)",
              "T (Teen)",
              "M (Mature)",
              "Ao (Adults Only)",
              "Any",
            ],
          },
        ],
      },
      {
        //G-TITLES SUBCATEGORY
        value: "titles",
        label: "Titles",
        fields: [
          {
            id: "eitherOr",
            label: "Are you looking for a similar title or something new?",
            type: "radio",
            options: ["Similar Title", "Something New"],
            subfields: {
              "Similar Title": [
                {
                  id: "similarTo",
                  label: "What're we looking for?",
                  type: "text",
                },
              ],
              "Something New": [
                {
                  id: "favoriteGenres",
                  label: "What's some of your favorite genres?",
                  type: "checkbox",
                  options: [
                    "Action",
                    "Adventure",
                    "Shooter",
                    "Fighting",
                    "Strategy",
                    "Puzzle",
                    "Simulation",
                    "Platformer",
                    "Racing",
                    "Sports",
                    "RPG",
                    "Any",
                  ],
                },
                {
                  id: "preferrableConsole",
                  label: "What console(s) do you play on?",
                  type: "checkbox",
                  options: [
                    "Playstation",
                    "Xbox",
                    "Nintendo",
                    "PC",
                    "iOS",
                    "Android",
                    "Any",
                  ],
                },
                {
                  id: "preferrableDevelopers",
                  label: "Any specific developers?",
                  type: "checkbox",
                  options: [
                    "Activision",
                    "Insomniac",
                    "Valve",
                    "Ubisoft",
                    "Square Enix",
                    "Capcom",
                    "Sega",
                    "EA",
                    "Nintendo",
                    "Telltale",
                    "Naughty Dog",
                    "Treyarch",
                    "2K",
                    "Rockstar",
                    "Any",
                  ],
                },
                {
                  id: "ageRating",
                  label: "What age range do you want to stay in?",
                  type: "checkbox",
                  options: [
                    "E (Everyone)",
                    "E10+ (Everyone 10+)",
                    "T (Teen)",
                    "M (Mature)",
                    "Ao (Adults Only)",
                    "Any",
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
];

export default FORM_OPTIONS;
