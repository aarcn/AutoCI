function promptAndConvertToArray(promptMessage) {
    let input = prompt(promptMessage);
    return input.split(', ').map(row => row.split(' '));
}

function displayMatrix(matrix, elementId) {
    let matrixHtml = '<table>';
    matrix.forEach(row => {
        matrixHtml += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    });
    matrixHtml += '</table>';

    document.getElementById(elementId).innerHTML = matrixHtml;
}

function displayRoutines(routines, elementId) {
    let routinesHtml = '<ul>';
    routines.forEach(routine => {
        routinesHtml += '<li>' + routine.join(', ') + '</li>';
    });
    routinesHtml += '</ul>';
    document.getElementById(elementId).innerHTML = routinesHtml;
}

function findPathsForRoutines(memoryMatrix, overrideRoutines) {
    return overrideRoutines.map(routine => findPathForRoutine(memoryMatrix, routine));
}

function findPathForRoutine(memoryMatrix, routine) {
    let paths = [];
    for (let rowIndex = 0; rowIndex < memoryMatrix.length; rowIndex++) {
        for (let colIndex = 0; colIndex < memoryMatrix[rowIndex].length; colIndex++) {
            if (memoryMatrix[rowIndex][colIndex] === routine[0]) {
                // start path from cell
                let path = [{ row: rowIndex, col: colIndex }];
                // keep in mind first cell orientation does not matter
                let success = searchPath(memoryMatrix, routine, path, 1, 'row');
                if (!success) {
                    success = searchPath(memoryMatrix, routine, path, 1, 'column');
                }
                if (success) {
                    paths.push(path);
                }
            }
        }
    }
    return paths.length > 0 ? paths.reduce((p1, p2) => p1.length < p2.length ? p1 : p2) : [];
}

function findNextStep(matrix, routine, stepIndex, currentPath, highlight) {
    if (stepIndex >= routine.length) {
        return true; // routine complete
    }

    let lastPos = currentPath[currentPath.length - 1];
    let nextValue = routine[stepIndex];
    let candidates = [];

    if (highlight === 'row') {
        for (let c = 0; c < matrix[lastPos.row].length; c++) {
            if (matrix[lastPos.row][c] === nextValue) {
                candidates.push({ row: lastPos.row, col: c });
            }
        }
    } else {
        for (let r = 0; r < matrix.length; r++) {
            if (matrix[r][lastPos.col] === nextValue) {
                candidates.push({ row: r, col: lastPos.col });
            }
        }
    }

    console.log(`Candidates for ${nextValue}:`, candidates);

    for (let candidatePos of candidates) {
        if (!currentPath.some(pos => pos.row === candidatePos.row && pos.col === candidatePos.col)) {
            currentPath.push(candidatePos);

            if (findNextStep(matrix, routine, stepIndex + 1, currentPath, highlight === 'row' ? 'column' : 'row')) {
                return true;
            }

            currentPath.pop();
        }
    }

    return false; // try new starting point
}

function searchPath(matrix, routine, path, routineIndex, highlight) {
    if (routineIndex >= routine.length) {
        return true;
    }

    let currentPos = path[path.length - 1];
    let nextValue = routine[routineIndex];

    let searchIndices = highlight === 'row' ? 
                        [...Array(matrix[currentPos.row].length).keys()] : 
                        [...Array(matrix.length).keys()];

    for (let i of searchIndices) {
        let candidatePos = highlight === 'row' ? { row: currentPos.row, col: i } : 
                                                  { row: i, col: currentPos.col };

        // check if cell has next value and isnt already part of path
        if (matrix[candidatePos.row][candidatePos.col] === nextValue && 
            !path.some(p => p.row === candidatePos.row && p.col === candidatePos.col)) {
            path.push(candidatePos);

            if (searchPath(matrix, routine, path, routineIndex + 1, highlight === 'row' ? 'column' : 'row')) {
                return true;
            }
            path.pop();
        }
    }

    // no solution
    return false;
}

function findNextCell(matrix, target, startPos, highlight) {
    let { row, col } = startPos;

    if (highlight === 'row') {
        for (let c = col + 1; c < matrix[row].length; c++) {
            if (matrix[row][c] === target) return { row, col: c };
        }
        for (let r = row + 1; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === target) return { row: r, col: c };
            }
        }
    } else {
        for (let r = row + 1; r < matrix.length; r++) {
            if (matrix[r][col] === target) return { row: r, col };
        }
        for (let c = col + 1; c < matrix[row].length; c++) {
            for (let r = 0; r < matrix.length; r++) {
                if (matrix[r][c] === target) return { row: r, col: c };
            }
        }
    }

    return null;
}

function findCellInMatrix(matrix, cell) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] === cell) {
                return { row: row, col: col };
            }
        }
    }
    return null;
}

function autoCI() {
    clearLines();

    let memoryMatrixInput = document.getElementById('memoryMatrix').value.toUpperCase();
    let overrideRoutinesInput = document.getElementById('overrideRoutines').value.toUpperCase();
    
    if(memoryMatrixInput && overrideRoutinesInput) {
        let memoryMatrix = memoryMatrixInput.split(', ').map(row => row.split(' '));
        let overrideRoutines = overrideRoutinesInput.split(', ').map(row => row.split(' '));

        displayMatrix(memoryMatrix, 'memoryMatrixDisplay');

        let matrixTable = document.getElementById('memoryMatrixDisplay').querySelector('table');
        let height = matrixTable.offsetHeight;
        
        setTimeout(() => {
            let paths = findPathsForRoutines(memoryMatrix, overrideRoutines);
            displayPaths(paths);
            displayRoutines(overrideRoutines, 'overrideRoutinesDisplay');
        }, 0);
    }
}

function drawLine(fromCell, toCell, color) {
    let fromRect = fromCell.getBoundingClientRect();
    let toRect = toCell.getBoundingClientRect();
    let containerRect = document.querySelector('.matrix-container').getBoundingClientRect();

    // line points relative to container
    let startX = fromRect.left - containerRect.left + window.scrollX + fromCell.offsetWidth / 2;
    let startY = fromRect.top - containerRect.top + window.scrollY + fromCell.offsetHeight / 2;
    let endX = toRect.left - containerRect.left + window.scrollX + toCell.offsetWidth / 2;
    let endY = toRect.top - containerRect.top + window.scrollY + toCell.offsetHeight / 2;

    let line = document.createElement("div");
    line.classList.add("line");

    // length + angle calcualtion of lines
    let length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    let angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    line.style.width = `${length}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY - 1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 0';
    line.style.backgroundColor = color;

    console.log(`Line element:`, line);
    document.getElementById('linesContainer').appendChild(line);
}

function clearLines() {
    const linesContainer = document.getElementById('linesContainer');
    while (linesContainer.firstChild) {
        linesContainer.removeChild(linesContainer.firstChild);
    }
}

function displayPaths(paths) {
    console.log('Displaying paths:', paths);
    let colors = ["red", "black", "blue", "orange", "purple"];
    paths.forEach((path, index) => {
        let color = colors[index % colors.length];
        console.log(`Path ${index}:`, path.map(p => `(${p.row},${p.col})`).join(' -> '));
        for (let i = 0; i < path.length - 1; i++) {
            let fromCell = getCellElement(path[i]);
            let toCell = getCellElement(path[i + 1]);
            if (fromCell && toCell) {
                console.log(`Drawing line from (${path[i].row},${path[i].col}) to (${path[i+1].row},${path[i+1].col})`);
                drawLine(fromCell, toCell, color);
            }
        }
    });
}

function getCellElement(point) {
    let matrixElement = document.getElementById('memoryMatrixDisplay').getElementsByTagName('table')[0];
    if (matrixElement && matrixElement.rows[point.row] && matrixElement.rows[point.row].cells[point.col]) {
        return matrixElement.rows[point.row].cells[point.col];
    }
    return null;
}

document.getElementById('solveButton').addEventListener('click', autoCI);