export function generateSector(width: number, height: number, levels: number) {
    const vertex_pos: number[] = [];
    const vertex_color: number[] = [];
    
    let previous_floor: number[] = [];

    for(let i = 0; i < levels; i++) {
        const tiles = [];
        const offset = [Math.floor((Math.random()-0.05)*1.1), Math.floor((Math.random()-0.05)*1.1)]
        for (let j = 0; j < width*height; j++) {
            const x = (j%width)+(0.5*(Math.floor(j/width)%2)) - width/2 + offset[0];
            const y = Math.floor(j/width)*0.75 - height*0.75/2 + offset[1];
            tiles.push(Math.hypot(x,y)/5+Math.random()*0.2 < 0.7 ? 1 : 0);
        }
        const floor = generateFloor(width,height, i/2-1, tiles)

        if (i > 0) {
            const walls = generateWalls(width, height, i/2-1.5, tiles, previous_floor);
            vertex_pos.push(...walls[0])
            vertex_color.push(...walls[1])
        }

        previous_floor = tiles;
        vertex_pos.push(...floor[0])
        vertex_color.push(...floor[1])
    }

    return [new Float32Array(vertex_pos), new Float32Array(vertex_color)];
}

function generateWalls(width: number, height: number, z: number, tiles: number[], tiles_previous: number[]) {
    const vertex_pos = [];
    const vertex_color = [];

    for (let i = 0; i < tiles.length; i ++) {
        const x = i % width;
        const y = Math.floor(i / width);

        const world_x = (i%width)+(0.5*(Math.floor(i/width)%2)) - width/2;
        const world_y = Math.floor(i/width)*0.75 - height*0.75/2;

        if (tiles[i] == 1 && tiles_previous[i] == 1) {
            if (x+1 < width) { // Right
                if (tiles[i] == 1 && tiles[i+1] == 0 && tiles_previous[i] == 1 && tiles_previous[i+1] == 0) {
                    const color = [Math.random(), Math.random(), Math.random(), 1]
                    vertex_pos.push(
                        world_x+0.5, z, world_y-0.25, world_x+0.5, z, world_y+0.25, world_x+0.5, z+0.5, world_y+0.25,
                        world_x+0.5, z+0.5, world_y-0.25, world_x+0.5, z, world_y-0.25, world_x+0.5, z+0.5, world_y+0.25,
                    )
                    vertex_color.push(
                        ...color, ...color, ...color,
                        ...color, ...color, ...color,
                    )
                }
            }
            if (x-1 >= 0) { // Left
                if (tiles[i-1] == 0 && tiles_previous[i-1] == 0) {
                    const color = [Math.random(), Math.random(), Math.random(), 1]
                    vertex_pos.push(
                        world_x-0.5, z, world_y-0.25, world_x-0.5, z, world_y+0.25, world_x-0.5, z+0.5, world_y+0.25,
                        world_x-0.5, z+0.5, world_y-0.25, world_x-0.5, z, world_y-0.25, world_x-0.5, z+0.5, world_y+0.25,
                    )
                    vertex_color.push(
                        ...color, ...color, ...color,
                        ...color, ...color, ...color,
                    )
                }
            }
    
            if (y % 2 == 0) {
                if (x-1 >= 0) {
                    if (y-1 >= 0) {
                        if (tiles[i-width-1] == 0 && tiles_previous[i-width-1] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x-0.5, z, world_y-0.25, world_x, z, world_y-0.5, world_x, z+0.5, world_y-0.5,
                                world_x-0.5, z+0.5, world_y-0.25, world_x-0.5, z, world_y-0.25, world_x, z+0.5, world_y-0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                        if (tiles[i-width] == 0 && tiles_previous[i-width] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x+0.5, z, world_y-0.25, world_x, z, world_y-0.5, world_x, z+0.5, world_y-0.5,
                                world_x+0.5, z+0.5, world_y-0.25, world_x+0.5, z, world_y-0.25, world_x, z+0.5, world_y-0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                    }
    
                    if (y+1 < height) {
                        if (tiles[i+width-1] == 0 && tiles_previous[i+width-1] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x-0.5, z, world_y+0.25, world_x, z, world_y+0.5, world_x, z+0.5, world_y+0.5,
                                world_x-0.5, z+0.5, world_y+0.25, world_x-0.5, z, world_y+0.25, world_x, z+0.5, world_y+0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                        if (tiles[i+width] == 0 && tiles_previous[i+width] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x+0.5, z, world_y+0.25, world_x, z, world_y+0.5, world_x, z+0.5, world_y+0.5,
                                world_x+0.5, z+0.5, world_y+0.25, world_x+0.5, z, world_y+0.25, world_x, z+0.5, world_y+0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                    }
                }
            } else {
                if (x+1 < width) {
                    if (y-1 >= 0) {
                        if (tiles[i-width] == 0 && tiles_previous[i-width] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x-0.5, z, world_y-0.25, world_x, z, world_y-0.5, world_x, z+0.5, world_y-0.5,
                                world_x-0.5, z+0.5, world_y-0.25, world_x-0.5, z, world_y-0.25, world_x, z+0.5, world_y-0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                        if (tiles[i-width+1] == 0 && tiles_previous[i-width+1] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x+0.5, z, world_y-0.25, world_x, z, world_y-0.5, world_x, z+0.5, world_y-0.5,
                                world_x+0.5, z+0.5, world_y-0.25, world_x+0.5, z, world_y-0.25, world_x, z+0.5, world_y-0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                    }
    
                    if (y+1 < height) {
                        if (tiles[i+width] == 0 && tiles_previous[i+width] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x-0.5, z, world_y+0.25, world_x, z, world_y+0.5, world_x, z+0.5, world_y+0.5,
                                world_x-0.5, z+0.5, world_y+0.25, world_x-0.5, z, world_y+0.25, world_x, z+0.5, world_y+0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                        if (tiles[i+width+1] == 0 && tiles_previous[i+width+1] == 0) {
                            const color = [Math.random(), Math.random(), Math.random(), 1]
                            vertex_pos.push(
                                world_x+0.5, z, world_y+0.25, world_x, z, world_y+0.5, world_x, z+0.5, world_y+0.5,
                                world_x+0.5, z+0.5, world_y+0.25, world_x+0.5, z, world_y+0.25, world_x, z+0.5, world_y+0.5,
                            )
                            vertex_color.push(
                                ...color, ...color, ...color,
                                ...color, ...color, ...color,
                            )
                        }
                    }
                }
            }
        }
    }

    return [vertex_pos, vertex_color]
}

function generateFloor(width: number, height: number, z: number, tiles: number[]) {
    const vertex_pos = [];
    const vertex_color = [];

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === 1) {
            const hex = generateHexagon([(i%width)+(0.5*(Math.floor(i/width)%2)) - width/2, z, Math.floor(i/width)*0.75 - height*0.75/2], [Math.random(),Math.random(), Math.random(), 1])
            vertex_pos.push(...hex[0])
            vertex_color.push(...hex[1])
        }
    }

    return [vertex_pos, vertex_color];
}

function generateHexagon(position: number[], color: number[]) {
    return [
        [
            position[0]-0.5,position[1],position[2]-0.25, position[0]  ,  position[1],position[2]-0.5,  position[0]+0.5,position[1],position[2]-0.25,
            position[0]-0.5,position[1],position[2]-0.25, position[0]+0.5,position[1],position[2]-0.25, position[0]-0.5,position[1],position[2]+0.25,
            position[0]-0.5,position[1],position[2]+0.25, position[0]+0.5,position[1],position[2]-0.25, position[0]+0.5,position[1],position[2]+0.25,
            position[0]-0.5,position[1],position[2]+0.25, position[0]+0.5,position[1],position[2]+0.25, position[0]  ,  position[1],position[2]+0.5,
        ], [
            ...color, ...color, ...color,
            ...color, ...color, ...color,
            ...color, ...color, ...color,
            ...color, ...color, ...color,
        ]
    ]
}