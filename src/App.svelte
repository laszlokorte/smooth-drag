<script>
	import {animate} from './animate.js'
	import {dnd} from './dnd.js'
	
	let position = {x:0,y:0}
	let target = {x:0,y:0}
	let velocity = {x:0,y:0}

	
	let dragging = false
	let baseTime = null
	let basePos = {x:0,y:0}

	let showTarget = false;
	let fullScreenDrag = true;

	const physicsConfigDefault = {
		maxTrackingTime: 160,
		minVelocity: 1,
		friction: 0.05,
		acceleration: 0.08,
		deceleration: 0.03,
		stiffness: 0.5,
		frameLength:4,
	}


	const physicsConfig = {
		maxTrackingTime: 160,
		minVelocity: 1,
		friction: 0.05,
		acceleration: 0.08,
		deceleration: 0.03,
		stiffness: 0.5,
		frameLength:4,
		stopVelocity: 0.001,
		normalizer: 16,
	}

	const physicsConfigRange = {
		maxTrackingTime: {min: 0, max: 300, step: 1},
		minVelocity: {min: 0, max: 20, step: 0.01},
		friction: {min: 0, max: 1, step: 0.01},
		acceleration: {min: 0, max: 1, step: 0.01},
		deceleration: {min: 0, max: 1, step: 0.01},
		stiffness: {min: 0, max: 1, step: 0.01},
	}

	let bounds = {
		minX: -400,
		maxX: 400,
		minY: -400,
		maxY: 400,
		margin: 400,
	}

	function softClamp(v, min, max, stiffness = 0.9) {
		const softness = 1-stiffness
		return Math.max(min*stiffness+v*softness, Math.min(v, max*stiffness+v*softness))
	}


	function resetPhysics() {
		position.x = 0
		position.y = 0
		target.x = 0
		target.y = 0
		velocity.x = 0
		velocity.y = 0
	}
	
	function resetParams() {
		for(let k in Object.keys(physicsConfig)) {
			physicsConfig[k] = physicsConfigDefault[k]
		}
	}

	
	function dragStart(pos, startTime, evt) {
		if(evt.target.classList.contains('draggable')) {
			baseTime = startTime
			basePos.x = position.x
			basePos.y = position.y
			velocity.x = 0
			velocity.y = 0
			dragging = true

			return true
		} else {
			return false
		}
	}
 
	function dragStop(pos, _prevPos, _startPos, currentTime, prevTime, _startTime,  _evt) {
		dragging = false
		if(currentTime - prevTime <= physicsConfig.maxTrackingTime) {
			const vx = (position.x-basePos.x)/(currentTime-baseTime)
			const vy = (position.y-basePos.y)/(currentTime-baseTime)

			if(Math.abs(vx) >= physicsConfig.minVelocity || Math.abs(vy) >= physicsConfig.minVelocity) {
				velocity.x = vx
				velocity.y = vy
			}
		}
	}

	function dragMove(pos, prevPos, _startPos, currentTime, _prevTime, _startTime,  _evt) {
		target.x += pos.x - prevPos.x
		target.y += pos.y - prevPos.y
		
		position.x = softClamp(target.x, bounds.minX, bounds.maxX, physicsConfig.stiffness)
		position.y = softClamp(target.y, bounds.minY, bounds.maxY, physicsConfig.stiffness)

		if(currentTime - baseTime > physicsConfig.maxTrackingTime) {
			baseTime = currentTime
			basePos.x = position.x
			basePos.y = position.y
		}
	}


	function step(dt) {
		if(!dragging) {
			const frictionLog = Math.log((1-physicsConfig.friction))
			const deceleration = physicsConfig.deceleration/physicsConfig.normalizer*Math.sqrt(dt)
			const acceleration = physicsConfig.acceleration/physicsConfig.normalizer*Math.sqrt(dt)
		
			const deflectionX = Math.min(0, target.x - bounds.minX) + Math.max(0, target.x - bounds.maxX)
			const deflectionY = Math.min(0, target.y - bounds.minY) + Math.max(0, target.y - bounds.maxY)

			const deflectionAndVelocityAlignedX = (deflectionX*velocity.x) > 0
			const deflectionAndVelocityAlignedY = (deflectionY*velocity.y) > 0

			
			velocity.x *= Math.exp(frictionLog*dt/physicsConfig.normalizer)
			velocity.y *= Math.exp(frictionLog*dt/physicsConfig.normalizer)
			
			if(Math.abs(velocity.x) < physicsConfig.stopVelocity) {
				velocity.x = 0
			}
			if(Math.abs(velocity.y) < physicsConfig.stopVelocity) {
				velocity.y = 0
			}
		

			if(deflectionAndVelocityAlignedX) {
				velocity.x += -deflectionX*deceleration
			} else if(deflectionX) {
				velocity.x = -deflectionX*acceleration
			}

			if(deflectionAndVelocityAlignedY) {
				velocity.y += -deflectionY*deceleration
			} else if(deflectionY) {
				velocity.y = -deflectionY*acceleration
			}

			target.x += velocity.x * dt
			target.y += velocity.y * dt
			position.x = softClamp(target.x, bounds.minX, bounds.maxX, physicsConfig.stiffness)
			position.y = softClamp(target.y, bounds.minY, bounds.maxY, physicsConfig.stiffness)
		}
	}

	const code = 
`const physicsConfig = {
	windowLength: 160,
	minVelocity: 1,
	friction: 0.05,
	acceleration: 0.08,
	deceleration: 0.03,
	stiffness: 0.5,
	frameLength:4,
	stopVelocity: 0.0001,
	normalizer: 16
}

// current physics state
let position = {x:0,y:0}
let target = {x:0,y:0}
let velocity = {x:0,y:0}

// current drag state
let dragging = false
let baseTime = null
let basePos = {x:0,y:0}


// linear soft clamp
function softClamp(v, min, max, stiffness = 0.9) {
	const softness = 1-stiffness
	return Math.max(min*stiffness+v*softness, Math.min(v, max*stiffness+v*softness))
}


// gets called when mouse is pressed down
function dragStart(pos, startTime) {
	baseTime = startTime
	basePos.x = position.x
	basePos.y = position.y
	velocity.x = 0
	velocity.y = 0
	dragging = true
}

// gets called when mouse is released
function dragStop(pos, currentTime, prevTime) {
	dragging = false

	if(currentTime - prevTime <= physicsConfig.windowLength) {
		const vx = (position.x-basePos.x)/(currentTime-baseTime)
		const vy = (position.y-basePos.y)/(currentTime-baseTime)

		if(Math.abs(vx) >= physicsConfig.minVelocity || Math.abs(vy) >= physicsConfig.minVelocity) {
			velocity.x = vx
			velocity.y = vy
		}
	}
}

// gets called when mouse is moved while pressed down
function dragMove(pos, prevPos, currentTime) {
	target.x += pos.x - prevPos.x
	target.y += pos.y - prevPos.y
	
	position.x = softClamp(target.x, bounds.minX, bounds.maxX, physicsConfig.stiffness)
	position.y = softClamp(target.y, bounds.minY, bounds.maxY, physicsConfig.stiffness)

	if(currentTime - baseTime > physicsConfig.windowLength) {
		baseTime = currentTime
		basePos.x = position.x
		basePos.y = position.y
	}
}

// gets called once every frame, eg 16 times per second
function step(dt) {
	if(!dragging) {
		const frictionLog = Math.log((1-physicsConfig.friction))
		const deceleration = physicsConfig.deceleration/physicsConfig.normalizer*Math.sqrt(dt)
		const acceleration = physicsConfig.acceleration/physicsConfig.normalizer*Math.sqrt(dt)
	
		const deflectionX = Math.min(0, target.x - bounds.minX) + Math.max(0, target.x - bounds.maxX)
		const deflectionY = Math.min(0, target.y - bounds.minY) + Math.max(0, target.y - bounds.maxY)

		const deflectionAndVelocityAlignedX = (deflectionX*velocity.x) > 0
		const deflectionAndVelocityAlignedY = (deflectionY*velocity.y) > 0

		
		velocity.x *= Math.exp(frictionLog*dt/physicsConfig.normalizer)
		velocity.y *= Math.exp(frictionLog*dt/physicsConfig.normalizer)
		
		if(Math.abs(velocity.x) < physicsConfig.stopVelocity) {
			velocity.x = 0
		}
		if(Math.abs(velocity.y) < physicsConfig.stopVelocity) {
			velocity.y = 0
		}
	

		if(deflectionAndVelocityAlignedX) {
			velocity.x += -deflectionX*deceleration
		} else if(deflectionX) {
			velocity.x = -deflectionX*acceleration
		}

		if(deflectionAndVelocityAlignedY) {
			velocity.y += -deflectionY*deceleration
		} else if(deflectionY) {
			velocity.y = -deflectionY*acceleration
		}

		target.x += velocity.x * dt
		target.y += velocity.y * dt
		position.x = softClamp(target.x, bounds.minX, bounds.maxX, physicsConfig.stiffness)
		position.y = softClamp(target.y, bounds.minY, bounds.maxY, physicsConfig.stiffness)
	}
}
` 
</script>

<style>
	:global(body) {
		margin: 0;
	}
	
	svg {
		position: fixed;
		output: 1px solid red;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		display: block;
		z-index: 500;
	}

	.overlay {
		background: #3333;
		z-index: 1000;
		position: absolute;
		border: 2px solid #4444;
		margin: 1em;
		padding: 1em 2em;
		max-width: 30em;
	}

	dl {
		display: grid;
		grid-template-columns: auto auto auto;
		justify-content: start;
		margin: 0;
		padding: 0;
		gap: 1em;
		align-items: baseline;
	}

	dd {
		padding: 0;
		margin: 0
	}

	dt {
		grid-column-start: 1;
	}

	input {
		margin: 0;
		padding: 0;
		accent-color: #f45;
	}
	button {
		cursor: pointer;
	}

	.draggable {
		cursor: move;
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 0.1s ease;
	}

	.hide {
		display: none;
	}
	h2 {
		margin: 0;
	}

	.dragging {
		transform: scale(1.1);
	}

	pre {
		width: 100%;
		overflow: scroll;
		background: #fff;
		padding: 1em;
		box-sizing: border-box;
	}

	summary {
		cursor: pointer;
	}
</style>

<div class="overlay">
	<h2>Cocoa Scroll Physics</h2>
	<p>
		This is an implementation of scroll physics inspired by iOS.<br>
		You can drag the red ball around inside the dark square. <br>
		If you drag it outside the dark bounds it will get pushed back.<br>
		If you drag it fast and release the mouse it keeps its <br>momentum and decelerates slowly.
	</p>
	<form on:submit|preventDefault>
		<dl>
	{#each Object.keys(physicsConfigRange) as confKey}
	<dt><label for="conf-{confKey}">{confKey}</label></dt>
	<dd><input id="conf-{confKey}" type="range" min="{physicsConfigRange[confKey].min}" max="{physicsConfigRange[confKey].max}" step="{physicsConfigRange[confKey].step}" bind:value={physicsConfig[confKey]}/></dd>
	<dd style:color="#000" style:text-shadow="0 0 10px #fff">{physicsConfig[confKey]}</dd>
	{/each}
	<dt><label for="target">Target Point</label></dt>
	<dd><label for="target"> <input bind:checked={showTarget} type="checkbox" id="target" /> Show</label></dd>
<dt>Drag</dt>
	<dd>
		<label><input bind:group={fullScreenDrag} value={false} type="radio" id="fullscreen-drag" /> Circle</label>
		<label><input bind:group={fullScreenDrag} value={true} type="radio" id="fullscreen-drag" /> Everywhere</label>
	</dd>
	<dt></dt>
	<dd>
		<button on:click={resetPhysics}>Reset Velocity</button>
		<button on:click={resetParams}>Reset Parameters</button>
	</dd>
</dl>
	</form>
	<details>
		<summary>Show implementation</summary>
		<pre>{code}</pre>
	</details>
	<center>
		<a href="https://tools.laszlokorte.de/" title="More Educational Tools">more educational tools</a>
	</center>
</div>

<svg class:draggable={fullScreenDrag} use:animate={{step, frameLength: physicsConfig.frameLength}} use:dnd={{dragStart,dragStop,dragMove}} viewBox="{bounds.minX - bounds.margin} {bounds.minY - bounds.margin} {bounds.maxX - bounds.minX + bounds.margin * 2} {bounds.maxY - bounds.minX + bounds.margin * 2}" width="1000" height="1000" preserveAspectRatio="xMaxYMid meet">
	<rect class:draggable={fullScreenDrag} x={bounds.minX} y={bounds.minY} width={bounds.maxX - bounds.minX} height={bounds.maxY - bounds.minY} fill="#444" stroke-width="8" stroke-dasharray="30 30" stroke="#567"></rect>
	<circle class:dragging class="draggable" cx={Math.round(position.x)} cy={Math.round(position.y)} r={100} fill="#f45"></circle>
	<circle class:hide={!showTarget} cx={Math.round(target.x)} cy={Math.round(target.y)} r={20} fill="white" stroke="#45f" stroke-width="10"></circle>
</svg>