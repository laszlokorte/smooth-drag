export function animate(node, options) {
	const targetFrameLength = options.frameLength || 16
	const step = options.step || (() => {})
	
	let scheduleFrame = null
	let prevTime = performance.now()
	
	function animationStep(time) {
		scheduleFrame = null
		const dt = (time - prevTime)
		let subFrames = Math.floor(dt / targetFrameLength)
		for(let i=0;i<subFrames;i++) {
			step(dt/subFrames, time)
		}
		if(subFrames) {
			prevTime = time
		}
		scheduleFrame = requestAnimationFrame(animationStep)
	}

	animationStep()

	return {
		destroy:  () => {
			if(scheduleFrame) {
				cancelAnimationFrame(scheduleFrame)
				scheduleFrame = null
			}
		}
	}
}