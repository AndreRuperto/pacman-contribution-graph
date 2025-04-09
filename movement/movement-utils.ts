import { GRID_HEIGHT, GRID_WIDTH, WALLS } from '../constants';

// Check for walls and grid edges
const getValidMoves = (x: number, y: number): [number, number][] => {
	const directions: [number, number][] = [
		[-1, 0], // left
		[1, 0], // right
		[0, -1], // up
		[0, 1] // down
	];
	return directions.filter(([dx, dy]) => {
		const newX = x + dx;
		const newY = y + dy;

		if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
			return false;
		}

		if (dx === -1) {
			return !WALLS.vertical[x][y].active;
		} else if (dx === 1) {
			return !WALLS.vertical[x + 1][y].active;
		} else if (dy === -1) {
			return !WALLS.horizontal[x][y].active;
		} else if (dy === 1) {
			return !WALLS.horizontal[x][y + 1].active;
		}

		return true;
	});
};

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const MovementUtils = {
	getValidMoves,
	calculateDistance
};
