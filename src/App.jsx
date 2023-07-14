// TODO: add validation for inputs
// TODO: add error handling for inputs
// TODO: add validation for inputs on submit
// TODO: build submit function
// TODO: add download output button

import { Component, Fragment } from 'react'
import './App.scss'

import { LOG } from './constants';

export class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			CLI: undefined,
			file: undefined,
			secondFile: undefined,
			threshold: 1.0,
			ambigs: "resolve",
			ambigsString: "",
			fraction: 1.0,
			format: "csv",
			overlap: 0,
			counts: ":",
			probability: 1,
			bootstrap: false,
			bootstrapAcrossSites: false,
			countFlag: false,
			compute: false,
			selfDistance: false,
		}
	}

	async componentDidMount() {
		document.addEventListener("wheel", function (event) {
			if (document.activeElement.type === "number") {
				document.activeElement.blur();
			}
		});

		this.setState({
			CLI: await new window.Aioli(["tn93/1.0.9"])
		}, () => {
			LOG("Loaded tn93.")
		})
	}

	setFile = (event) => {
		this.setState({ file: event.target.files[0] })
	}

	clearFile = () => {
		this.setState({ file: undefined })
	}

	setSecondFile = (event) => {
		this.setState({ secondFile: event.target.files[0] })
	}

	clearSecondFile = () => {
		this.setState({ secondFile: undefined })
	}

	setThreshold = (event) => {
		this.setState({ threshold: event.target.value })
	}

	setAmbigs = (event) => {
		this.setState({ ambigs: event.target.value })
	}

	setAmbigsString = (event) => {
		this.setState({ ambigsString: event.target.value })
	}

	setFraction = (event) => {
		this.setState({ fraction: event.target.value })
	}

	setFormat = (event) => {
		this.setState({ format: event.target.value })
	}

	setOverlap = (event) => {
		this.setState({ overlap: event.target.value })
	}

	setCounts = (event) => {
		this.setState({ counts: event.target.value })
	}

	setProbability = (event) => {
		this.setState({ probability: event.target.value })
	}

	setBootstrap = (event) => {
		this.setState({ bootstrap: event.target.checked })
	}

	setBootstrapAcrossSites = (event) => {
		this.setState({ bootstrapAcrossSites: event.target.checked })
	}

	setCountFlag = (event) => {
		if (event.target.checked) {
			this.setFormat({
				target: { value: "csv" }
			})
		}

		this.setState({ countFlag: event.target.checked })
	}

	setCompute = (event) => {
		this.setState({ compute: event.target.checked })
	}

	setSelfDistance = (event) => {
		this.setState({ selfDistance: event.target.checked })
	}

	render() {
		return (
			<div className="app">
				<h2 className="mt-5 mb-2 w-100 text-center">TN-93 Web App</h2>
				<p className="mb-5 w-100 text-center">A web implementation of <a href="https://github.com/veg/tn93" target="_blank" rel="noreferrer">tn93</a>. Created with Biowasm.</p>
				<div id="content">
					<div id="input">
						<h5 className="my-0">Input</h5>
						<div id="input-form" className="mt-3 px-3 pt-3 pb-4">
							<p className="mb-2">FASTA Sequence File: <span style={{ color: 'red' }}>*</span></p>
							<input type="file" className="form-control mb-3" id="input-file" onChange={this.setFile} onClick={this.clearFile} />

							<h6 className="mt-5">Optional Arguments</h6>
							<hr></hr>

							<p className="mb-2">Second FASTA Sequence File:</p>
							<input type="file" className="form-control mb-3" id="second-file" onChange={this.setSecondFile} onClick={this.clearSecondFile} />

							<p className="mb-2">Threshold: </p>
							<input type="number" className="form-control" id="input-threshold" placeholder="Default: 1.0" min="0" max="1" step="0.01" value={this.state.threshold} onInput={this.setThreshold} />

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
							<input type="number" className="form-control" id="input-fraction" value={this.state.fraction} onInput={this.setFraction} placeholder={`${(this.state.ambigs === "resolve" || this.state.ambigs === "string") ? 'Default: 1.0' : ''}`} min="0" max="1" step="0.01" disabled={!(this.state.ambigs === "resolve" || this.state.ambigs === "string")} />

							<p className={`mt-3 mb-2 ${this.state.countFlag && 'text-disabled'}`}>Output Format: (Default: CSV)</p>
							<select className="form-select" id="input-format" disabled={this.state.countFlag} value={this.state.format} onChange={this.setFormat}>
								<option value="csv">CSV</option>
								<option value="csvn">CSVN</option>
								<option value="hyphy">HYPHY</option>
							</select>

							<p className="mt-3 mb-2">Overlap minimum:</p>
							<input type="number" className="form-control" id="input-overlap" placeholder="Default: 0" min="0" value={this.state.overlap} onInput={this.setOverlap} />

							<p className="mt-3 mb-2">Counts in name:</p>
							<input type="text" className="form-control" id="input-counts" placeholder='Default: ":"' value={this.state.counts} onInput={this.setCounts} />

							<p className="mt-3 mb-2">Sequence Subsample Probability:</p>
							<input type="number" className="form-control" id="input-probability" placeholder="Default: 1.0" min="0" value={this.state.probability} onInput={this.setProbability} />

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
					<div id="output">
						<h5 className="my-0">Console</h5>
						<textarea id="output-console" className="mt-3 px-3 pt-3 pb-4 w-100" placeholder="Output will appear here..." readOnly></textarea>
					</div>
				</div>
			</div >
		)
	}
}

export default App