function calculateBitLength(str) {
    const GSM_7_1slot = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:;<=>?¡¿!\"#¤%&'()*+,-./ÄÖÑÜ§äöñüà@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ ";
    const GSM_7_2slot = "€^{}[]~|";
    const GSM_7_2slotChars = new Set(GSM_7_2slot.split(''));

    const isUCS2 = [...str].some(char => !GSM_7_1slot.includes(char) && !GSM_7_2slot.includes(char));

    if (isUCS2) {
        const emojiCount = (str.match(/\p{Extended_Pictographic}/ug) || []).length;

        let calculatedLength = str.length + emojiCount;

        if (calculatedLength > 70) {
            let segments = [];
            let startPointer = 0;

            while (startPointer < str.length) {
                let range = str.length - startPointer;

                if (range <= 67) {
                    segments.push(str.slice(startPointer));
                    break;
                } else {
                    let endPointer = startPointer + 67;
                    while (endPointer > startPointer && /\p{Extended_Pictographic}/u.test(str[endPointer])) {
                        endPointer--;
                    }
                    segments.push(str.slice(startPointer, endPointer));
                    startPointer = endPointer;
                }
            }

            let bitLength = segments.reduce((acc, seg) => {
                return acc + 48 + seg.length * 16;
            }, 0);

            const encoding = isUCS2 ? "UCS-2" : "GSM-7";
            return { encoding, length };
        } else {
            let bitLength = str.length * 16;
            const encoding = isUCS2 ? "UCS-2" : "GSM-7";
            return { encoding, length };
        }
    } else {
        const gsm7_2slotCount = (str.match(/[€\^\{\}\[\]\~\|]/g) || []).length;

        let calculatedLength = str.length + gsm7_2slotCount;

        if (calculatedLength > 160) {
            let segments = [];
            let startPointer = 0;

            while (startPointer < str.length) {
                let range = str.length - startPointer;

                if (range <= 153) {
                    segments.push(str.slice(startPointer));
                    break;
                } else {
                    let endPointer = startPointer + 153;
                    while (endPointer > startPointer && GSM_7_2slotChars.has(str[endPointer])) {
                        endPointer--;
                    }
                    segments.push(str.slice(startPointer, endPointer));
                    startPointer = endPointer;
                }
            }

            let bitLength = segments.reduce((acc, seg) => {
                return acc + 48 + seg.split('').reduce((subAcc, char) => {
                    return subAcc + (GSM_7_2slotChars.has(char) ? 14 : 7);
                }, 0);
            }, 0);

            const encoding = isUCS2 ? "UCS-2" : "GSM-7";
            return { encoding, length };
        } else {
            let bitLength = str.split('').reduce((acc, char) => {
                return acc + (GSM_7_2slotChars.has(char) ? 14 : 7);
            }, 0);

            const encoding = isUCS2 ? "UCS-2" : "GSM-7";
            return { encoding, length };
        }
    }
}

// Example usage:
const result = calculateBitLength("Rumors say there will be free healthy smoothies at the Twilio booth 🥤🍓🍍");
console.log(result);
