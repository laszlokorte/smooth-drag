


export function dnd(svg, options) {
	const svgPoint = svg.createSVGPoint()
	const dragMove = options.dragMove
	const dragStop = options.dragStop
	const dragStart = options.dragStart
	
	function eventXY(event) {
		var ctm = svg.getScreenCTM();
		svgPoint.x = event.clientX;
		svgPoint.y = event.clientY;
		let {x,y} = svgPoint.matrixTransform(ctm.inverse());

		return {x,y}
	}

	let draggig = false;
	let startPos = null
	let prevPos = null
	let prevTime = null
	let startTime = null

	function onPointerMove(evt) {
		if(draggig) {
			const pos = eventXY(evt)
			const currentTime = performance.now()
			dragMove(eventXY(evt), prevPos, startPos, currentTime, prevTime, startTime, evt)
			prevPos = pos
			prevTime = currentTime
		}
	}
	
	function onPointerUp(evt) {
		if(draggig) {
			draggig = false
			const currentTime = performance.now()
			dragStop(eventXY(evt), prevPos, startPos, currentTime, prevTime, startTime,  evt)
			startPos = null
			prevPos = null
			prevTime = null
			startTime = null
		}
	}
	
	function onPointerDown(evt) {
		if(!draggig) {
			draggig = true
			const pos = eventXY(evt)
			startPos = pos
			prevPos = pos
			startTime = performance.now()
			prevTime = startTime
			if(dragStart(pos, startTime, evt) === false) {
				draggig = false
				startPos = null
				prevPos = null
				prevTime = null
				startTime = null
			}
		}
	}
	

	window.addEventListener('pointermove', onPointerMove, false)
	window.addEventListener('pointerup', onPointerUp, false)
	svg.addEventListener('pointerdown', onPointerDown, false)
	
	return {
		destroy:  () => {
			window.removeEventListener('pointermove', onPointerMove, false)
			window.removeEventListener('pointerup', onPointerUp, false)
			svg.removeEventListener('pointerdown', onPointerDown, false)
		}
	}
}