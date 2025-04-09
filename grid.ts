import { GRID_HEIGHT, GRID_WIDTH, setWall } from './constants';

const setSymmetricWall = (x: number, y: number, direction: 'horizontal' | 'vertical', sym: '' | 'x' | 'y' | 'xy', lineId: string) => {
	if (direction == 'horizontal') {
		setWall(x, y, 'horizontal', lineId);
		if (sym == 'x') {
			setWall(GRID_WIDTH - x - 1, y, 'horizontal', lineId);
		} else if (sym == 'y') {
			setWall(x, GRID_HEIGHT - y, 'horizontal', lineId);
		} else if (sym == 'xy') {
			setWall(GRID_WIDTH - x - 1, y, 'horizontal', lineId);
			setWall(x, GRID_HEIGHT - y, 'horizontal', lineId);
			setWall(GRID_WIDTH - x - 1, GRID_HEIGHT - y, 'horizontal', lineId);
		}
	} else {
		setWall(x, y, 'vertical', lineId);
		if (sym == 'x') {
			setWall(GRID_WIDTH - x, y, 'vertical', lineId);
		} else if (sym == 'y') {
			setWall(x, GRID_HEIGHT - y - 1, 'vertical', lineId);
		} else if (sym == 'xy') {
			setWall(GRID_WIDTH - x, y, 'vertical', lineId);
			setWall(x, GRID_HEIGHT - y - 1, 'vertical', lineId);
			setWall(GRID_WIDTH - x, GRID_HEIGHT - y - 1, 'vertical', lineId);
		}
	}
};

const buildWalls = () => {
	// Left and right wings
	// L1
	setSymmetricWall(0, 2, 'horizontal', 'xy', 'L1');
	setSymmetricWall(1, 2, 'horizontal', 'xy', 'L1');
	// L2
	setSymmetricWall(4, 0, 'vertical', 'x', 'L2');
	setSymmetricWall(4, 1, 'vertical', 'x', 'L2');
	setSymmetricWall(4, 2, 'vertical', 'x', 'L2');
	setSymmetricWall(4, 3, 'vertical', 'x', 'L2');
	setSymmetricWall(4, 4, 'vertical', 'x', 'L2');
	// L3
	setSymmetricWall(3, 3, 'horizontal', 'x', 'L3');
	setSymmetricWall(2, 3, 'horizontal', 'x', 'L3');
	// L4
	setSymmetricWall(4, 5, 'horizontal', 'x', 'L4');
	// L5
	setSymmetricWall(6, 4, 'vertical', 'x', 'L5');
	setSymmetricWall(6, 3, 'vertical', 'x', 'L5');
	setSymmetricWall(6, 2, 'vertical', 'x', 'L5');
	// L6
	setSymmetricWall(6, 2, 'horizontal', 'x', 'L6');
	setSymmetricWall(7, 2, 'horizontal', 'x', 'L6');
	setSymmetricWall(8, 2, 'horizontal', 'x', 'L6');
	setSymmetricWall(9, 2, 'horizontal', 'x', 'L6');
	// L7
	setSymmetricWall(13, 2, 'horizontal', 'xy', 'L7');
	setSymmetricWall(14, 2, 'horizontal', 'xy', 'L7');
	setSymmetricWall(15, 2, 'horizontal', 'xy', 'L7');
	setSymmetricWall(16, 2, 'horizontal', 'xy', 'L7');
	setSymmetricWall(17, 2, 'horizontal', 'xy', 'L7');
	setSymmetricWall(18, 2, 'horizontal', 'xy', 'L7');
	// L8
	setSymmetricWall(16, 2, 'vertical', 'xy', 'L8');
	// L9
	setSymmetricWall(8, 1, 'horizontal', 'x', 'L9');
	setSymmetricWall(9, 1, 'horizontal', 'x', 'L9');
	setSymmetricWall(10, 1, 'horizontal', 'x', 'L9');
	setSymmetricWall(11, 1, 'horizontal', 'x', 'L9');
	// L10
	setSymmetricWall(12, 1, 'vertical', 'x', 'L10');
	setSymmetricWall(12, 3, 'vertical', 'x', 'L10');
	// L11
	setSymmetricWall(11, 4, 'horizontal', 'x', 'L11');
	setSymmetricWall(10, 4, 'horizontal', 'x', 'L11');
	setSymmetricWall(9, 4, 'horizontal', 'x', 'L11');
	setSymmetricWall(8, 4, 'horizontal', 'x', 'L11');
	// L12
	setSymmetricWall(8, 4, 'vertical', 'x', 'L12');
	setSymmetricWall(8, 5, 'vertical', 'x', 'L12');
	setSymmetricWall(8, 6, 'vertical', 'x', 'L12');
	// L13
	setSymmetricWall(23, 2, 'horizontal', 'x', 'L13');
	setSymmetricWall(24, 2, 'horizontal', 'x', 'L13');
	setSymmetricWall(23, 4, 'horizontal', 'x', 'L13');
	setSymmetricWall(24, 4, 'horizontal', 'x', 'L13');
	setSymmetricWall(25, 4, 'horizontal', 'x', 'L13');
	// L14
	setSymmetricWall(23, 2, 'vertical', 'x', 'L14');
	setSymmetricWall(23, 3, 'vertical', 'x', 'L14');
	// L15
	setSymmetricWall(26, 4, 'vertical', 'x', 'L15');
	setSymmetricWall(26, 5, 'vertical', 'x', 'L15');
	// L16
	setSymmetricWall(23, 6, 'horizontal', 'x', 'L16');
	setSymmetricWall(24, 6, 'horizontal', 'x', 'L16');
	setSymmetricWall(25, 6, 'horizontal', 'x', 'L16');
	// L17
	setSymmetricWall(26, 0, 'vertical', 'x', 'L17');
	// L18
	setSymmetricWall(24, 1, 'vertical', 'x', 'L18');
	setSymmetricWall(23, 1, 'horizontal', 'x', 'L18');
	setSymmetricWall(22, 1, 'horizontal', 'x', 'L18');
	setSymmetricWall(21, 1, 'horizontal', 'x', 'L18');
	setSymmetricWall(21, 1, 'vertical', 'x', 'L18');
	setSymmetricWall(21, 2, 'vertical', 'x', 'L18');
	setSymmetricWall(21, 3, 'vertical', 'x', 'L18');
	setSymmetricWall(20, 4, 'horizontal', 'x', 'L18');
	setSymmetricWall(19, 4, 'horizontal', 'x', 'L18');
	setSymmetricWall(19, 3, 'vertical', 'x', 'L18');
	setSymmetricWall(18, 3, 'horizontal', 'x', 'L18');
	// L19
	setSymmetricWall(22, 5, 'vertical', 'x', 'L19');
	setSymmetricWall(21, 5, 'horizontal', 'x', 'L19');
	setSymmetricWall(20, 5, 'horizontal', 'x', 'L19');
	setSymmetricWall(20, 5, 'vertical', 'x', 'L19');
	// L20
	setSymmetricWall(1, 6, 'horizontal', 'x', 'L20');
	setSymmetricWall(2, 6, 'horizontal', 'x', 'L20');
	setSymmetricWall(3, 5, 'vertical', 'x', 'L20');
	setSymmetricWall(3, 4, 'vertical', 'x', 'L20');
	// L21
	setSymmetricWall(5, 6, 'horizontal', 'x', 'L21');
	setSymmetricWall(6, 6, 'horizontal', 'x', 'L21');
};

export const Grid = {
	buildWalls
};
