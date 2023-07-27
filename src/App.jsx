import { Component } from 'react'
import Pako from 'pako';

import { LOG, EXAMPLE_FILE_NAME, EXAMPLE_FILE_OUTPUT_NAME, SECOND_INPUT_FILE_NAME } from './constants';
import './App.scss'

export class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			CLI: undefined,

			file: undefined,
			validFile: true,

			secondFile: undefined,

			threshold: 1.0,
			validThreshold: true,

			ambigs: "resolve",

			ambigsString: "",

			fraction: 1.0,
			validFraction: true,

			format: "csv",

			overlap: 1,
			validOverlap: true,

			counts: ":",
			validCounts: true,

			probability: 1,
			validProbability: true,

			bootstrap: false,
			bootstrapAcrossSites: false,
			countFlag: false,
			compute: false,
			selfDistance: false,

			inputChanged: false,
			tn93Done: false,
			gzipOutput: true,
			outputFileName: undefined,

			expandedContainer: undefined,
			optionalOpen: false,

			exampleData: undefined,

			errorMessage: undefined,
		}
	}

	async componentDidMount() {
		document.addEventListener("wheel", () => {
			if (document.activeElement.type === "number") {
				document.activeElement.blur();
			}
		});

		this.setState({
			CLI: await new window.Aioli(["tn93/1.0.11"])
		}, () => {
			LOG("Loaded tn93.")
		})
	}

	setFile = (event) => {
		this.setState(prevState => {
			let inputChanged = false;
			if (prevState.file === undefined && event.target.files[0] !== undefined) {
				inputChanged = true;
			}

			if (prevState.file !== undefined && event.target.files[0] === undefined) {
				inputChanged = true;
			}

			if (prevState.file !== undefined && event.target.files[0] !== undefined) {
				if (prevState.file.name !== event.target.files[0].name) {
					inputChanged = true;
				}
			}

			return {
				inputChanged,
				validFile: event.target.files[0] !== undefined,
				file: event.target.files[0]
			}
		})
	}

	clearFile = () => {
		this.setState({ file: undefined })
	}

	setSecondFile = (event) => {
		this.setState(prevState => {
			let inputChanged = false;
			if (prevState.secondFile === undefined && event.target.files[0] !== undefined) {
				inputChanged = true;
			}

			if (prevState.secondFile !== undefined && event.target.files[0] === undefined) {
				inputChanged = true;
			}

			if (prevState.secondFile !== undefined && event.target.files[0] !== undefined) {
				if (prevState.secondFile.name !== event.target.files[0].name) {
					inputChanged = true;
				}
			}

			return {
				inputChanged,
				secondFile: event.target.files[0]
			}
		})
	}

	clearSecondFile = () => {
		this.setState({ secondFile: undefined })
	}

	setThreshold = (event) => {
		this.setState({ threshold: event.target.value, inputChanged: true, validThreshold: event.target.value >= 0 && event.target.value <= 1 })
	}

	setAmbigs = (event) => {
		this.setState({ ambigs: event.target.value, inputChanged: true })
	}

	setAmbigsString = (event) => {
		this.setState({ ambigsString: event.target.value, inputChanged: true })
	}

	setFraction = (event) => {
		this.setState({ fraction: event.target.value, inputChanged: true, validFraction: event.target.value >= 0 && event.target.value <= 1 })
	}

	setFormat = (event) => {
		this.setState({ format: event.target.value, inputChanged: true })
	}

	setOverlap = (event) => {
		this.setState({ overlap: event.target.value, inputChanged: true, validOverlap: event.target.value >= 1 && event.target.value == parseInt(event.target.value) })
	}

	setCounts = (event) => {
		this.setState({ counts: event.target.value, inputChanged: true, validCounts: event.target.value.length === 1 })
	}

	setProbability = (event) => {
		this.setState({ probability: event.target.value, inputChanged: true, validProbability: event.target.value >= 0 && event.target.value <= 1 })
	}

	setBootstrap = (event) => {
		this.setState({ bootstrap: event.target.checked, inputChanged: true })
	}

	setBootstrapAcrossSites = (event) => {
		this.setState({ bootstrapAcrossSites: event.target.checked, inputChanged: true })
	}

	setCountFlag = (event) => {
		if (event.target.checked) {
			this.setFormat({
				target: { value: "csv" }
			})
		}

		this.setState({ countFlag: event.target.checked, inputChanged: true })
	}

	setCompute = (event) => {
		this.setState({ compute: event.target.checked, inputChanged: true })
	}

	setSelfDistance = (event) => {
		this.setState({ selfDistance: event.target.checked, inputChanged: true })
	}

	toggleOptionalOpen = (open = undefined) => {
		this.setState(prevState => {
			return { optionalOpen: open === undefined ? !prevState.optionalOpen : open }
		})
	}

	toggleExpandContainer = (container) => {
		this.setState(prevState => {
			return { expandedContainer: prevState.expandedContainer === container ? undefined : container }
		});
	}

	toggleGzipOutput = () => {
		this.setState(prevState => { return { gzipOutput: !prevState.gzipOutput } })
	}

	runTN93 = async () => {
		const CLI = this.state.CLI;
		const startTime = performance.now();
		document.getElementById("output-console").value = "";

		// validation
		let valid = true;
		let validFile = true;
		let validThreshold = true;
		let validFraction = true;
		let validOverlap = true;
		let validCounts = true;
		let validProbability = true;

		if (this.state.file === undefined) {
			valid = false;
			validFile = false;
		}

		if (this.state.threshold < 0 || this.state.threshold > 1) {
			valid = false;
			validThreshold = false;
		}

		if (this.state.fraction < 0 || this.state.fraction > 1) {
			valid = false;
			validFraction = false;
		}

		if (!(this.state.overlap >= 1 && this.state.overlap == parseInt(this.state.overlap))) {
			valid = false;
			validOverlap = false;
		}

		if (this.state.countFlag && this.state.counts.length !== 1) {
			valid = false;
			validCounts = false;
		}

		if (this.state.probability < 0 || this.state.probability > 1) {
			valid = false;
			validProbability = false;
		}

		this.setState({
			validFile,
			validThreshold,
			validFraction,
			validOverlap,
			validCounts,
			validProbability,
			errorMessage: valid ? "" : "Please check your inputs and try again."
		})

		if (!validThreshold || !validFraction || !validOverlap || !validCounts || !validProbability) {
			this.toggleOptionalOpen(true);
		}

		if (!valid) {
			setTimeout(() => {
				this.setState({ errorMessage: "" })
			}, 2000)
			LOG("Error running tn93, please check your inputs and try again.")
			return;
		}

		await this.deleteOldFiles();
		this.setState({ tn93Done: false, inputChanged: false })

		// mount input file and setup output file
		let outputFileName;
		let cleanInputFileName;

		if (this.state.file === 'EXAMPLE_DATA') {
			LOG("Using example data...")
			CLI.fs.writeFile(EXAMPLE_FILE_NAME, this.state.exampleData);
			cleanInputFileName = EXAMPLE_FILE_NAME;
			outputFileName = EXAMPLE_FILE_OUTPUT_NAME;
		} else {
			LOG("Reading input fasta sequence file...")
			let inputFileData;
			if (this.state.file.name.endsWith(".gz")) {
				try {
					inputFileData = Pako.ungzip(await this.fileReaderReadFile(this.state.file, true));
				} catch (err) {
					LOG("Error unzipping input fasta sequence file " + this.state.file.name + ".");
					return;
				}
			} else {
				inputFileData = await this.fileReaderReadFile(this.state.file);
			}

			cleanInputFileName = this.state.file.name.replace(".gz", "").replace(" ", "_");
			CLI.fs.writeFile(cleanInputFileName, inputFileData);
			outputFileName = (cleanInputFileName.substring(0, cleanInputFileName.indexOf('.')) || cleanInputFileName) + "_pariwise_distances.txt";
		}
		this.setState({ outputFileName })

		// mount second input file
		if (this.state.secondFile) {
			LOG("Reading second fasta sequence file...")
			let secondFileData;
			if (this.state.secondFile.name.endsWith(".gz")) {
				try {
					secondFileData = Pako.ungzip(await this.fileReaderReadFile(this.state.secondFile, true));
				} catch (err) {
					LOG("Error unzipping second fasta sequence file " + this.state.secondFile.name + ".");
					return;
				}
			} else {
				secondFileData = await this.fileReaderReadFile(this.state.secondFile);
			}

			CLI.fs.writeFile(this.state.secondFile.name.replace(".gz", "").replace(" ", "_"), secondFileData);
		}

		// TODO: better extension? 
		let command = "tn93 -o " + outputFileName; 

		// add threshold
		command += " -t " + (this.state.threshold === "" ? "1.0" : this.state.threshold);

		// add ambigs
		command += " -a " + (this.state.ambigs === "string" ? this.state.ambigsString : this.state.ambigs);

		// add fraction
		command += " -g " + (this.state.fraction === "" ? "1.0" : this.state.fraction);

		// add format
		if (!this.state.countFlag) {
			command += " -f " + this.state.format;
		}

		// add overlap
		command += " -l " + (this.state.overlap === "" ? "0" : this.state.overlap);

		// add counts
		command += " -d " + `"${(this.state.counts === "" ? ":" : this.state.counts)}"`;

		// add probability
		command += " -u " + (this.state.probability === "" ? "1" : this.state.probability);

		// add bootstrap
		if (this.state.bootstrap) {
			command += " -b";
		}

		// add bootstrap across sites
		if (this.state.bootstrap && this.state.secondFile && this.state.bootstrapAcrossSites) {
			command += " -r";
		}

		// add count flag
		if (this.state.countFlag) {
			command += " -c";
		}

		// add compute
		if (this.state.secondFile && this.state.compute) {
			command += " -c";
		}

		// add self distance
		if (this.state.selfDistance) {
			command += " -0";
		}

		// add second input file
		if (this.state.secondFile) {
			command += " -s " + SECOND_INPUT_FILE_NAME;
		}

		// add input file
		command += " " + cleanInputFileName;

		// run tn93
		LOG("Running tn93, command: " + command);
		const output = await CLI.exec(command);
		LOG("tn93 output: \n" + output);

		if ((await CLI.ls(outputFileName))?.blocks === 0) {
			LOG("Error running tn93. No output file generated.");
		} else {
			this.setState({ tn93Done: true })
			LOG("Done running tn93, time elapsed: " + (performance.now() - startTime).toFixed(2) + "ms");
		}
	}

	deleteOldFiles = async () => {
		const CLI = this.state.CLI;
		const files = await CLI.ls('./');

		for (const file of files) {
			if (file === '.' || file === '..') {
				continue;
			}
			CLI.fs.unlink(file);
		}
	}

	// helper function to read file as text or arraybuffer and promisify
	fileReaderReadFile = async (file, asArrayBuffer = false) => {
		return new Promise((resolve) => {
			const fileReader = new FileReader();
			fileReader.onload = () => {
				resolve(fileReader.result);
			}
			if (asArrayBuffer) {
				fileReader.readAsArrayBuffer(file);
			} else {
				fileReader.readAsText(file);
			}
		})
	}

	downloadOutput = () => {
		this.downloadFile(this.state.outputFileName, this.state.gzipOutput);
	}

	downloadFile = async (fileName, gzip = false) => {
		const CLI = this.state.CLI;
		if (!(await CLI.ls(fileName))) {
			return;
		}

		const fileData = await CLI.fs.readFile(fileName, { encoding: 'binary' });

		let fileBlob;

		if (gzip) {
			const gzippedFileData = Pako.gzip(fileData);
			fileBlob = new Blob([gzippedFileData], { type: 'application/octet-stream' });
			fileName += ".gz";
		} else {
			fileBlob = new Blob([fileData], { type: 'text/plain' });
		}

		var objectUrl = URL.createObjectURL(fileBlob);

		const element = document.createElement("a");
		element.href = objectUrl;
		element.download = fileName;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);

		LOG(`Downloaded ${fileName}`)
	}

	loadExampleData = async () => {
		let exampleData = this.state.exampleData;
		if (this.state.exampleData === undefined) {
			// fetch example data
			exampleData = await fetch("test.fas").then(res => res.text());
			this.setState({ exampleData })
		}

		this.setState({
			file: 'EXAMPLE_DATA',
			validFile: true,
			inputChanged: true,
		})

		document.getElementById("input-file").value = "";
	}

	render() {
		return (
			<div className="app">
				<h2 className="mt-5 mb-2 w-100 text-center">TN93 Web App</h2>
				<p className="my-3 w-100 text-center">
					A web implementation of tn93. For more information and usage, see <a href="https://github.com/veg/tn93" target="_blank" rel="noreferrer">github.com/veg/tn93</a>.<br />
					Created with Biowasm.
				</p>
				<div id="content">
					<div id="input" className={`mt-4 ${this.state.expandedContainer === 'input' && 'full-width-container'} ${this.state.expandedContainer === 'output' && 'd-none'}`}>
						<div id="input-header">
							<h5 className="my-0">Input</h5>
							<h4 className="my-0">
								<i className={`bi bi-${this.state.expandedContainer === 'input' ? 'arrows-angle-contract' : 'arrows-fullscreen'}`} onClick={() => this.toggleExpandContainer('input')}></i>
							</h4>
						</div>
						<div id="input-form" className="mt-3 px-3 pt-3 pb-4">
							<p className="mb-2">FASTA Sequence File:<span style={{ color: 'red' }}>*</span> <strong>{this.state.file === 'EXAMPLE_DATA' ? <span>Using Example <a href="https://github.com/veg/tn93/blob/master/data/test.fas" target="_blank" rel="noreferrer">File</a></span> : ''}</strong></p>
							<input type="file" className={`mb-3 form-control ${!this.state.validFile && 'is-invalid'}`} id="input-file" onChange={this.setFile} onClick={this.clearFile} />

							<h6 className="mt-5" id="optional-arguments" onClick={() => this.toggleOptionalOpen()}>Optional Arguments <i className={`bi bi-chevron-${this.state.optionalOpen ? 'up' : 'down'}`}></i></h6>
							<hr></hr>

							<div className={`${this.state.optionalOpen ? '' : 'd-none'}`}>
								<p className="mb-2">Second FASTA Sequence File:</p>
								<input type="file" className="form-control mb-3" id="second-file" onChange={this.setSecondFile} onClick={this.clearSecondFile} />

								<p className="mb-2">Threshold: </p>
								<input type="number" className={`form-control ${!this.state.validThreshold && 'is-invalid'}`} id="input-threshold" placeholder="Default: 1.0" min="0" max="1" step="0.01" value={this.state.threshold} onInput={this.setThreshold} />

								<p className="mt-3 mb-2">Ambiguous Nucleotide Strategy (Default: Resolve)</p>
								<select className="form-select" id="input-ambiguity" value={this.state.ambigs} onChange={this.setAmbigs}>
									<option value="resolve">Resolve</option>
									<option value="average">Average</option>
									<option value="skip">Skip</option>
									<option value="gapmm">Gapmm</option>
									<option value="string">String</option>
								</select>

								<p className={`mt-3 mb-2 ${!(this.state.ambigs === "string") && 'text-disabled'}`}>Ambiguous Nucleotide String: </p>
								<input type="text" className="form-control" id="input-ambiguity-string" disabled={!(this.state.ambigs === "string")} value={this.state.ambigsString} onInput={this.setAmbigsString} />

								<p className={`mt-3 mb-2 ${!(this.state.ambigs === "resolve" || this.state.ambigs === "string") && 'text-disabled'}`}>Maximum tolerated fraction of ambig. characters:</p>
								<input type="number" className={`form-control ${!this.state.validFraction && 'is-invalid'}`} id="input-fraction" value={this.state.fraction} onInput={this.setFraction} placeholder={`${(this.state.ambigs === "resolve" || this.state.ambigs === "string") ? 'Default: 1.0' : ''}`} min="0" max="1" step="0.01" disabled={!(this.state.ambigs === "resolve" || this.state.ambigs === "string")} />

								<p className={`mt-3 mb-2 ${this.state.countFlag && 'text-disabled'}`}>Output Format: (Default: CSV)</p>
								<select className="form-select" id="input-format" disabled={this.state.countFlag} value={this.state.format} onChange={this.setFormat}>
									<option value="csv">CSV</option>
									<option value="csvn">CSVN</option>
									<option value="hyphy">HYPHY</option>
								</select>

								<p className="mt-3 mb-2">Overlap minimum:</p>
								<input type="number" className={`form-control ${!this.state.validOverlap && 'is-invalid'}`} id="input-overlap" placeholder="Default: 1" min="1" value={this.state.overlap} onInput={this.setOverlap} />

								<p className="mt-3 mb-2">Counts in name:</p>
								<input type="text" className={`form-control ${!this.state.validCounts && 'is-invalid'}`} id="input-counts" placeholder='Default: ":"' value={this.state.counts} onInput={this.setCounts} />

								<p className="mt-3 mb-2">Sequence Subsample Probability:</p>
								<input type="number" className={`form-control ${!this.state.validProbability && 'is-invalid'}`} id="input-probability" placeholder="Default: 1.0" min="0" value={this.state.probability} onInput={this.setProbability} />

								<div className="form-check my-4">
									<input className="form-check-input" type="checkbox" id="input-bootstrap" checked={this.state.bootstrap} onChange={this.setBootstrap} />
									<label className="form-check-label" htmlFor="input-bootstrap">
										-b: Bootstrap alignment columns
									</label>
								</div>

								<div className="form-check my-4">
									<input className="form-check-input" type="checkbox" id="input-bootstrap-across-sites" checked={this.state.bootstrapAcrossSites} onChange={this.setBootstrapAcrossSites} disabled={this.state.secondFile && this.state.bootstrap} />
									<label className="form-check-label" htmlFor="input-bootstrap-across-sites">
										-r: Bootstrap across sites
									</label>
								</div>

								<div className="form-check my-4">
									<input className="form-check-input" type="checkbox" id="input-count" checked={this.state.countFlag} onChange={this.setCountFlag} />
									<label className="form-check-label" htmlFor="input-count">
										-c: Only count pairs below the threshold
									</label>
								</div>

								<div className="form-check my-4">
									<input className="form-check-input" type="checkbox" id="input-compute" checked={this.state.compute} onChange={this.setCompute} disabled={this.state.secondFile} />
									<label className="form-check-label" htmlFor="input-compute">
										-m: compute inter- and intra-population means
									</label>
								</div>

								<div className="form-check my-4">
									<input className="form-check-input" type="checkbox" id="input-zero" checked={this.state.selfDistance} onChange={this.setSelfDistance} />
									<label className="form-check-label" htmlFor="input-zero">
										-0: report distances between each sequence and itself
									</label>
								</div>
							</div>
						</div>
						<button className={`btn btn-${this.state.file === 'EXAMPLE_DATA' ? 'success' : 'warning'}  mt-3 w-100`} onClick={this.loadExampleData}>Load Example File {this.state.file === 'EXAMPLE_DATA' ? '(Currently Using Example File)' : ''}</button>
						<button className="btn btn-primary mt-3 w-100" onClick={this.runTN93}>Run TN93</button>
					</div>
					<div id="output" className={`mt-4 ${this.state.expandedContainer === 'output' && 'full-width-container'} ${this.state.expandedContainer === 'input' && 'd-none'}`}>
						<div id="output-header">
							<h5 className="my-0">Console</h5>
							<h4 className="my-0">
								<i className={`bi bi-${this.state.expandedContainer === 'output' ? 'arrows-angle-contract' : 'arrows-fullscreen'}`} onClick={() => this.toggleExpandContainer('output')}></i>
							</h4>
						</div>
						<textarea id="output-console" className="mt-3 px-3 pt-3 pb-4 w-100" placeholder="Output will appear here..." readOnly></textarea>
						{(this.state.inputChanged && this.state.tn93Done) && <p className="my-2 text-danger text-center">Note: The input has been edited since the last run.</p>}
						<div id="download-container" className="mt-3 w-100">
							<div className="form-check px-3 py-2 mb-0 border border-primary" id="output-gzip-container" onClick={this.toggleGzipOutput}>
								<input className="form-check-input me-3" type="checkbox" id="output-gzip" checked={this.state.gzipOutput} onChange={this.toggleGzipOutput} />
								<label className="form-check-label" htmlFor="output-gzip">
									Compress Output
								</label>
							</div>
							<button className="btn btn-primary" onClick={this.downloadOutput} disabled={!this.state.tn93Done}>Download Output</button>
						</div>
					</div>
					<div id="error-modal" className={`px-3 py-4 text-danger text-center ${(this.state.errorMessage === undefined || this.state.errorMessage.length === 0) && 'd-none'}`}>
						{this.state.errorMessage}
					</div>
				</div>
			</div >
		)
	}
}

export default App