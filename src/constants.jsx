export const INPUT_FILE = "input.txt";
export const OUTPUT_FILE = "output.txt";
export const OUTPUT_ID = "output-console";

export const LOG = (output) => {
    const textArea = document.getElementById(OUTPUT_ID);
    const date = new Date();
    textArea.value += `${getTimeWithMilliseconds(date)}: ` + output + "\n";
}

export const getTimeWithMilliseconds = date => {
    const t = date.toLocaleTimeString();
    return `${t.substring(0, 7)}.${("00" + date.getMilliseconds()).slice(-3)}`;
}