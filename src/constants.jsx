export const EXAMPLE_FILE_NAME = "example.fas";
export const EXAMPLE_FILE_OUTPUT_NAME = "example_pairwise_distances.csv";
export const SECOND_INPUT_FILE_NAME = "second_file.fas";
export const OUTPUT_ID = "output-console";

export const LOG = (output) => {
    const textArea = document.getElementById(OUTPUT_ID);
    const date = new Date();
    textArea.value += `${getTimeWithMilliseconds(date)}: ` + output + "\n";
	textArea.scrollTop = textArea.scrollHeight;
}

export const getTimeWithMilliseconds = date => {
    const t = date.toLocaleTimeString();
    return `${t.substring(0, 7)}.${("00" + date.getMilliseconds()).slice(-3)}`;
}