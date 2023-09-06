const noop = (() => {});

export function animate(node, options) {
	let targetFrameLength = options.frameLength || 16
	let step = options.step || noop
	
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
		},
		update:  (ops) => {
			console.log(ops.frameLength)
			targetFrameLength = ops.frameLength || 16
			step = ops.step || noop
		}
	}
}