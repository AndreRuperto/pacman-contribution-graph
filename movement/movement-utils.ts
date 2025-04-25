import { GRID_HEIGHT, GRID_WIDTH, WALLS } from '../constants.js';
import { Point2d } from '../types.js';

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

/* …importações ficam iguais… */

export const MovementUtils = {
	getValidMoves,
	calculateDistance,

	/**
	 * Dijkstra de grade 4-direções.
	 * Retorna o PRÓXIMO passo (não a rota inteira) ou null se não houver.
	 */
	findNextStepDijkstra(
		start: Point2d, target: Point2d
	): Point2d | null {
		if (start.x === target.x && start.y === target.y) return null;

		const pq: {x:number; y:number; cost:number; path:Point2d[]}[] = [
			{ ...start, cost:0, path:[] }
		];
		const visited = new Set<string>([`${start.x},${start.y}`]);

		while (pq.length) {
			// min-heap “manual”
			pq.sort((a,b)=>a.cost-b.cost);
			const {x,y,cost,path} = pq.shift()!;

			for (const [dx,dy] of getValidMoves(x,y)) {
				const nx = x+dx, ny = y+dy, key = `${nx},${ny}`;
				if (visited.has(key)) continue;
				visited.add(key);

				const nextCost = cost + 1;           // custo unitário
				const newPath  = [...path,{x:nx,y:ny}];

				if (nx === target.x && ny === target.y) {
					return newPath[0] ?? null;
				}
				pq.push({x:nx,y:ny,cost:nextCost,path:newPath});
			}
		}
		return null;
	}
};