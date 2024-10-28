let winningMasks;

const PHRASE_BITS = 8; // Number of bits needed to store phrase index (2^5 = 32 possible phrases)
const TOTAL_TILES = 25;

const bitsetContainer = document.getElementById('bitset'); // Your container for the UI

const phrases = [
    "Jävlar",
    "Easy!",
    "Sluta!",
    "I'm scared",
    "We're fine!",
    "Woah",
    "You lil' shit",
    "Aha!",
    "Vad är det?",
    "I'm so confused...",
    "Oh my god",
    "Kom då",
    "Really?",
    "Where am I?",
    "Men näääee",
    "Nej!",
    "What am I supposed to do?",
    "Oj!",
    "Stop it",
    "Oh goodness gracious",
    "Look at that!",
    "I can do this",
    "This is terrifying.",
    "That was so not fair!",
    "Va?!",
];

const CONTENTS = [
    {
        contentType: "emoji",
        themes: {
            christmas: "❄️",
            halloween: "🕸️",
        },
        chance: 5,
    },
    {
        contentType: "emoji",
        themes: {
            christmas: "🎄",
            halloween: "👻",
        },
        chance: 45,
    },
    {
        contentType: "emoji",
        themes: {
            christmas: "☃️",
            halloween: "🎃",
        },
        chance: 45,
    },
    {
        contentType: "emoji",
        themes: {
            christmas: "🦝",
            halloween: "🦝",
        },
        chance: 1,
    },
    {
        contentType: "emoji",
        themes: {
            christmas: "🦌",
            halloween: "🦌",
        },
        chance: 4,
    },
    {
        contentType: "image",
        themes: {
            christmas: "https://cdn.discordapp.com/attachments/315521922886533120/1300159530130210878/lynnie.png?ex=671fd36b&is=671e81eb&hm=9f935ef50c29d41ee41fa1efc882a8cdca59653bf9fe97e83b9311a0a6900c2c&",
            halloween: "https://arbetsformedlingen.se/webdav/files/logo/logo.svg",
        },
        chance: 10,
    },
    {
        contentType: "text",
        themes: {
            christmas: "This is a fairly long sentence!",
            halloween: "Happy Halloween!",
        },
        chance: 5,
    },
];

const getRandomContent = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'christmas';
    const probability = CONTENTS.flatMap(({ chance }, index) => Array(chance).fill(index));
    const index = Math.floor(Math.random() * probability.length);
    const content = CONTENTS[probability[index]];

    return {
        contentType: content.contentType,
        content: content.themes[theme] ?? null // Ensure we handle fallback properly
    };
}

const getRandomPhrase = () => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
};

const displayContent = (contentObject, container) => {
    // Clear the previous content
    container.innerHTML = '';

    // Handle different content types
    if (contentObject.contentType === 'emoji') {
        // Handle emoji content
        const emojiElement = document.createElement('span');
        emojiElement.textContent = contentObject.content;
        container.appendChild(emojiElement);
    } else if (contentObject.contentType === 'text') {
        // Handle text content
        const textElement = document.createElement('p');
        textElement.textContent = contentObject.content;
        textElement.style.fontSize = "25px"
        container.appendChild(textElement);
    } else if (contentObject.contentType === 'image') {
        // Handle image content
        const imgElement = document.createElement('img');
        imgElement.src = contentObject.content;
        imgElement.alt = 'Content Image';
        imgElement.style.width = '75%';
        imgElement.style.height = '75%';
        imgElement.style.objectFit = 'contain'; 
        container.appendChild(imgElement);
    }
}


// Create an array to hold the bits, where each element represents a bit in the bingo card
const createBitSet = (size) => {
    return new Uint32Array(Math.ceil(size / 32)); // This can still work for bit operations
}

// Method to set a bit at the specified bitIndex
const set = (bitsArray, bitIndex) => {
    const arrayIndex = Math.floor(bitIndex / 32);
    const bitPosition = bitIndex % 32;
    bitsArray[arrayIndex] |= (1 << bitPosition);
}

// Method to clear (unset) a bit at the specified bitIndex
const clear = (bitsArray, bitIndex) => {
    const arrayIndex = Math.floor(bitIndex / 32);
    const bitPosition = bitIndex % 32;
    bitsArray[arrayIndex] &= ~(1 << bitPosition);
}

// Method to check if a bit at the specified bitIndex is set (i.e., if it's 1)
const isSet = (bitsArray, bitIndex) => {
    const arrayIndex = Math.floor(bitIndex / 32);
    const bitPosition = bitIndex % 32;
    return (bitsArray[arrayIndex] & (1 << bitPosition)) !== 0;
}

const createBingoGame = (x, y) => {
    const size = x * y; // Total bits needed (5 * 5 = 25)
    const bitSet = createBitSet(size);
    return bitSet;
}

const setPhraseIndex = (phraseBitSet, index, phraseIndex) => {
    const bitPosition = index * PHRASE_BITS;
    const arrayIndex = Math.floor(bitPosition / 32);
    const bitOffset = bitPosition % 32;
    phraseBitSet[arrayIndex] &= ~(31 << bitOffset); // Clear previous bits
    phraseBitSet[arrayIndex] |= (phraseIndex << bitOffset); // Set new phrase bits
};

// Get the phrase index from the bitset
const getPhraseIndex = (phraseBitSet, index) => {
    const bitPosition = index * PHRASE_BITS;
    const arrayIndex = Math.floor(bitPosition / 32);
    const bitOffset = bitPosition % 32;
    return (phraseBitSet[arrayIndex] >> bitOffset) & 31; // Extract the 8 bits (31 in binary)
};

const saveToLocalStorage = (key, bitSet) => {
    const byteArray = new Uint8Array(bitSet.buffer); // Convert to byte array
    let binaryString = '';
    byteArray.forEach(byte => {
        binaryString += String.fromCharCode(byte); // Convert each byte to a character
    });
    localStorage.setItem(key, binaryString); // Save binary string to localStorage
};

// Function to load the bitsets from localStorage
const loadFromLocalStorage = (key, size) => {
    const binaryString = localStorage.getItem(key);
    if (!binaryString) return false; // If no data, return a new bitset
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    return new Uint32Array(byteArray.buffer);
};

// Create the UI for the bits
const createUI = (bitSet, phraseBitSet) => {
    for (let i = 0; i < TOTAL_TILES; i++) {
        const bitElement = document.createElement('div');
        bitElement.classList.add('bit');
        bitElement.dataset.index = i; // Store the index

        // Check if the bit at index i is set
        if (isSet(bitSet, i)) {
            const randomContent = getRandomContent();
            console.log(randomContent)
            displayContent(randomContent, bitElement);
            bitElement.classList.add('active'); // Add active class
        } else {
            const phraseIndex = getPhraseIndex(phraseBitSet, i);
            bitElement.innerHTML = phrases[phraseIndex]; // Set to the stored phrase if bit is inactive
        }
        // Add click event listener to toggle the bit
        bitElement.addEventListener('click', () => {
            const index = parseInt(bitElement.dataset.index, 10);
            if (isSet(bitSet, index)) {
                clear(bitSet, index);
                bitElement.classList.remove('active');
                const phraseIndex = getPhraseIndex(phraseBitSet, index);
                bitElement.innerHTML = phrases[phraseIndex]; // Show the stored phrase when deactivated
            } else {
                set(bitSet, index);
                bitElement.classList.add('active');
                const randomContent = getRandomContent();
                displayContent(randomContent, bitElement);
            }
            saveToLocalStorage("state", bitSet); // Save the state
            saveToLocalStorage("phrases", phraseBitSet); // Save the phrase indices
            const bingo = hasBingo(bitSet);
            if (bingo) {
                win(bitSet, phraseBitSet)
            }
        });
        const bingoWinDiv = document.getElementById("win");
        bingoWinDiv.style.visibility = "hidden";
        bitsetContainer.appendChild(bitElement); // Append to the container
    }
};

const generateWinningMasks = () => {
    const masks = new Array(8).fill(0); // 5 rows + 5 columns + 2 diagonals

    // Masks for rows and columns in a single pass
    for (let i = 0; i < 5; i++) {
        masks[i] = (1 << (i * 5)) | (1 << (i * 5 + 1)) | (1 << (i * 5 + 2)) | (1 << (i * 5 + 3)) | (1 << (i * 5 + 4)); // Row mask

        masks[i + 5] = (1 << i) | (1 << (i + 5)) | (1 << (i + 10)) | (1 << (i + 15)) | (1 << (i + 20)); // Column mask
    }

    // Mask for top-left to bottom-right diagonal
    masks[10] = (1 << 0) | (1 << 6) | (1 << 12) | (1 << 18) | (1 << 24); // Diagonal 1: bits 0, 6, 12, 18, 24

    // Mask for top-right to bottom-left diagonal
    masks[11] = (1 << 4) | (1 << 8) | (1 << 12) | (1 << 16) | (1 << 20); // Diagonal 2: bits 4, 8, 12, 16, 20

    return masks;
}

const hasBingo = (bitSet) => {
    // Combine the bits in the Uint32Array to a single number for checking
    let bitSetNumber = 0;
    for (let i = 0; i < bitSet.length; i++) {
        bitSetNumber |= (bitSet[i] << (i * 32)); // Merge bits from the Uint32Array into a single number
    }

    // Check each mask
    for (const mask of winningMasks) {
        if ((bitSetNumber & mask) === mask) {
            return true; // Valid bingo if all bits for that mask are set
        }
    }
    return false;
}

const win = (bitSet, phraseBitSet) => {
    const bingoAnswerDiv = document.getElementById("answers");
    const bingoWinDiv = document.getElementById("win");

    // Clear previous answers
    bingoAnswerDiv.innerHTML = '';

    // Iterate through the bitSet to find active phrases
    for (let i = 0; i < TOTAL_TILES; i++) {
        if (isSet(bitSet, i)) { // Check if the bit is set for the current index
            const bingoAnswer = document.createElement("p");
            bingoAnswer.classList.add("bingo-answer-child");
            bingoAnswer.innerText = phrases[getPhraseIndex(phraseBitSet, i)]; // Use phraseBitSet to get correct phrase index
            bingoAnswerDiv.appendChild(bingoAnswer);
        }
    }
    bingoWinDiv.style.visibility = "visible";
}

const reset = () => {
    const bingoAnswerDiv = document.getElementById("answers");
    bingoAnswerDiv.innerHTML = "";

    const bingoWinDiv = document.getElementById("win");
    bingoWinDiv.style.visibility = "hidden";

    while (bitsetContainer.hasChildNodes()) {
        bitsetContainer.removeChild(bitsetContainer.firstChild);
    }
    localStorage.clear();
    initializeGame();
}

const initializeGame = () => {
    let bitSet = loadFromLocalStorage("state", TOTAL_TILES);
    let phraseBitSet = loadFromLocalStorage("phrases", TOTAL_TILES * PHRASE_BITS);

    if (!bitSet) bitSet = createBitSet(TOTAL_TILES);
    if (!phraseBitSet) {
        phraseBitSet = createBitSet(TOTAL_TILES * PHRASE_BITS);

        // Create an array of phrase indices (0 to phrases.length - 1)
        const phraseIndices = Array.from({ length: phrases.length }, (_, index) => index);
        //  Shuffle the phrase indices
        const shuffledPhraseIndices = phraseIndices.sort(() => Math.random() - 0.5);
        //  Assign the shuffled indices to the tiles
        for (let i = 0; i < TOTAL_TILES; i++) {
            const randomPhraseIndex = shuffledPhraseIndices[i]; // Wrap around if TOTAL_TILES > phrases.length
            //console.log(`Assigned phrase index: ${i}-${randomPhraseIndex}-${phrases[randomPhraseIndex]}`); // Log the assigned index for debugging

            // Store the phrase index in the bitset
            setPhraseIndex(phraseBitSet, i, randomPhraseIndex);
        }
    }
    createUI(bitSet, phraseBitSet); // Create the UI
};

window.onload = () => {
    document.documentElement.setAttribute("data-theme", "christmas");
    winningMasks = generateWinningMasks();
    initializeGame();
};