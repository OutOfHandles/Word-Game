const board_div = document.querySelector('#board');
let difficulty_btns = document.querySelectorAll('.difficulty1');
let reset_btn = document.querySelector('#reset');
let btn_play_again = document.querySelector('#btn_play_again');
let win_screen = document.querySelector('#win_screen');

let control = {
    control_times: 1,
    row0: '',
    col0: '',
    row1: '',
    col1: '',
    type: 'none', // row/col/dia
    win: 0
}

let board_def = {
    dim: 11,
    difficulty: 4
}

let board = new Array(board_def.dim);
let selected = true;

let generated_word;

let hor_ver_dia;

const random_words = ['CSS', 'HTML', 'Javascript', 'Elephant', 'Sunshine', 'Keyboard', 'Butterfly', 'Happiness', 'Mountain', 'Ocean', 
'Rainbow', 'Symphony', 'Adventure', 'Chocolate', 'Galaxy', 'Firefly', 'Waterfall', 'Moonlight', 'Serendipity', 'Whisper', 'Starlight', 
'Blossom', 'Harmony', 'Whale', 'Sunflower', 'Laughter', 'Cupcake', 'Dragon', 'Peace', 'Thunderstorm', 'Seashell', 'Magic', 'Wonder', 'Unicorn', 
'Mystery', 'Journey', 'Candlelight', 'Dream', 'Serenade', 'Reflection', 'Sparkle', 'Cascade', 'Silhouette'];

let current_words = []; 
let word_list_ = [];
let selected_word = [];
let selected_word_index = 0;

function random_number(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//player movement control

function check_movement(row, col){
    if(control.control_times > 2){
        control_times = 3;
        if((parseInt(control.row0)+1 == row && parseInt(control.col0)+1 == col && control.type == 'dia') || (parseInt(control.row0)-1 == row && parseInt(control.col0)+1 == col && control.type == 'dia1')){ //dia
            control.row0 = row;
            control.col0 = col;
            return true;
        }
        if((parseInt(control.row1)+1 == row && parseInt(control.col1)-1 == col && control.type == 'dia1') || (parseInt(control.row1)-1 == row && parseInt(control.col1)-1 == col && control.type == 'dia')){ //dia
            control.row1 = row;
            control.col1 = col;
            return true;
        }
        if(parseInt(control.row0) != row && parseInt(control.col0) == col && control.type == 'col'){  //col
            return true;
        }
        if(parseInt(control.row0) == row && parseInt(control.col0) != col && control.type == 'row'){ //row
            return true;
        }
    }
    control.control_times = 1;
    return false;
}

function identify_movement(row, col){
    if(control.control_times == 1){
        control.row0 = row;
        control.col0 = col;
        control.row1 = row;
        control.col1 = col;
    }
    if(control.control_times == 2){
        if(parseInt(control.row0)+1 == row && parseInt(control.col0)+1 == col){
            control.type = 'dia';
            control.row0 = row;
            control.col0 = col;
        }
        if(parseInt(control.row0)-1 == row && parseInt(control.col0)+1 == col){
            control.type = 'dia1';
            control.row0 = row;
            control.col0 = col;
        }
        if(parseInt(control.row1)-1 == row && parseInt(control.col1)-1 == col){
            control.type = 'dia';
            control.row1 = row;
            control.col1 = col;
        }
        if(parseInt(control.row1)+1 == row && parseInt(control.col1)-1 == col){
            control.type = 'dia1';
            control.row1 = row;
            control.col1 = col;
        }
        if(parseInt(control.row0) != row && parseInt(control.col0) == col){ 
            control.type = 'col';
            control.row0 = row;
            control.col0 = col;
        }
        if(parseInt(control.row0) == row && parseInt(control.col0) != col){
            control.type = 'row';
            control.row0 = row;
            control.col0 = col;
        }
    }
}

function check_selected_around(row, col){
    for(let i = parseInt(row) - 1; i <= parseInt(row)+1; i++){
        for(let j = parseInt(col) - 1; j <= parseInt(col)+1; j++){
            if(i < 0 || j < 0 || i >= board_def.dim || j >= board_def.dim || (i == row && j == col)){
                continue;
            }
            const checking = document.querySelectorAll('#option\\ ' + i + '\\ ' + j);
            if(checking.length > 0 && checking[0].classList.contains('selected')){
                return true;
            }
        }
    }
    return false;
}

// clear on wrong move

function clear_selected(){
    const option = document.querySelectorAll('[id^="option"]');
    option.forEach(function(btn){
        btn.classList.remove('selected');
    });
    selected_word = [];
    selected_word_index = 0;
    control.control_times = 1;
}

// generation type checks

function check_space_diagonal(row, col, length){
    row = parseInt(row);
    col = parseInt(col);
    for(let i = col, j = row; i < col + length; i++, j++){
        if(board[j][i] != ''){
            return false;
        }
    }
    return true;
}

function check_space_diagonal_type1(row, col, length){
    row = parseInt(row);
    col = parseInt(col);
    for(let i = col, j = row; i > col - length; i--, j++){
        console.log(j + ' ' + i);
        if(board[j][i] !== ''){
            return false;
        }
    }
    return true;
}

function check_space_horizontal(row, col, length){
    row = parseInt(row);
    col = parseInt(col);
    for(let i = row; i < row + length; i++){
        if(board[i][col] != ''){
            return false;
        }
    }
    return true;
}

function check_space_vertical(row, col, length){
    row = parseInt(row);
    col = parseInt(col);
    for(let i = col; i < col + length; i++){
        if(board[row][i] != ''){
            return false;
        }
    }
    return true;
}

// cross word if theyre correct

function cross_word(index){
    let element_to_cross = document.querySelector('#word\\ ' + index);
    element_to_cross.style.textDecoration = 'line-through';
    element_to_cross.style.color = 'green';
}

//check if the words match

function check_if_correct(){
    for(let i = 0; i < board_def.difficulty; i++){
        if(selected_word.length == current_words[i].length){
            if(selected_word.join('').toUpperCase().split('').sort().join('') == current_words[i].toUpperCase().split('').sort().join('')){
                let selected_things = document.querySelectorAll('.selected');
        
                selected_things.forEach(function(element) {
                    element.classList.remove('selected');
                    element.classList.add('correct'); 
                });
                control.control_times = 1;
                cross_word(i);
                control.win++;
                return true;
            }
        }
    }
    return false;
}

//loading functions

function load_words_list(){
    const words_container = document.querySelector('#words-list');
    for(let i = 0; i<board_def.difficulty; i++){
        let span = document.createElement('span');
        span.id = 'word ' + i;
        span.textContent = word_list_[i];
        words_container.appendChild(span)
    }
}

function update_board(){
    for(let i = 0; i<board_def.dim; i++){
        for(let j = 0; j<board_def.dim; j++){
            const test =  document.getElementById('option ' + i + ' ' + j);
            test.textContent = board[i][j];
        }
    }
}

function generate_letters(){
    for(let i = 0; i<board_def.dim; i++){
        for(let j = 0; j<board_def.dim; j++){
            if(board[i][j] == ''){
                board[i][j] = String.fromCharCode(random_number(65, 86));
            }
        }
    }
}

function put_words(){
    for(let i = 0; i < board_def.difficulty; i++){
        let error = true;
        do{
            try{
                do{
                    generated_word = random_words[random_number(0, random_words.length - 1)];
                } while(current_words.includes(generated_word));
                word_list_[i] = generated_word;
                
                if(Math.random() > 0.7){
                    generated_word = generated_word.split('').reverse().join('');
                }

                current_words[i] = generated_word;
                
                let cant_fit = true;
                let attempts = 0;
                do{
                    attempts++;
                    let row = random_number(0, board_def.dim-1);
                    let col = random_number(0, board_def.dim-1);
                    const random = Math.random();
                    if(random <= 1/3){ //horizontal
                        if(generated_word.length + parseInt(row) < board_def.dim){
                            if(check_space_horizontal(row, col, generated_word.length)){
                                for(let j = 0; j < generated_word.length; j++){
                                    board[row+j][col] = generated_word[j].toLocaleUpperCase();
                                }
                                cant_fit = false;
                            }
                        }
                    }
                    if(random > 1/3 && random <= 2/3){ // vertical
                        if(generated_word.length + parseInt(col) < board_def.dim){
                            if(check_space_vertical(row, col, generated_word.length)){
                                for(let j = 0; j < generated_word.length; j++){
                                    board[row][col+j] = generated_word[j].toLocaleUpperCase();
                                }
                                cant_fit = false;
                            }
                        }
                    }
                    if(random > 2/3){ //diagonal
                        if(generated_word.length + parseInt(col) < board_def.dim && generated_word.length + parseInt(row) < board_def.dim){
                            if(Math.random() <= .1){
                                if(check_space_diagonal(row, col, generated_word.length)){
                                    for(let j = 0; j < generated_word.length; j++){
                                        board[row+j][col+j] = generated_word[j].toLocaleUpperCase();
                                    }
                                    cant_fit = false;
                                }
                            }
                            else{
                                if(check_space_diagonal_type1(row, col, generated_word.length)){
                                    for(let j = 0; j < generated_word.length; j++){
                                        board[row+j][col-j] = generated_word[j].toLocaleUpperCase();
                                    }
                                    cant_fit = false;
                                }
                            }
                        }
                    }
                }while(cant_fit && attempts < 100);
                if(attempts < 100){
                    update_board();
                    error = false;
                }
            }
            catch(err){
                error = true;
            }
        }while(error);
    }
}

function space(){
    for(let i = 0; i<board_def.dim; i++){
        for(let j = 0; j<board_def.dim; j++){
            board[i][j] = '';
        }
    }
}

function loadBoard(){
    for(let i = 0; i < board_def.dim; i++) {
        board[i] = new Array(board_def.dim);
        for(let j = 0; j < board_def.dim; j++){
            let span = document.createElement('span');
            span.id = 'option' + ' ' + i + ' ' + j;
            board_div.appendChild(span);
        }
    }
    board_div.style.gridTemplateColumns = 'repeat(' + board_def.dim + ', 1fr)';
    board_div.style.gridTemplateRows = 'repeat(' + board_def.dim + ', 1fr)';
    
    const option = document.querySelectorAll('[id^="option"]');
    
    option.forEach(function(btn){
        btn.addEventListener('click', function(){
            if(!btn.classList.contains('selected') && !btn.classList.contains('correct')){
                let btn_id = btn.id.split(" ");
                if(!check_selected_around(btn_id[1], btn_id[2]) || (control.control_times > 2 && !check_movement(btn_id[1], btn_id[2]))){
                    clear_selected();
                }
                if(!btn.classList.contains("correct") && !btn.classList.contains('selected') || (control.control_times > 2 && !check_movement(btn_id[1], btn_id[2]))){
                    btn.classList.add("selected");
                    selected_word[selected_word_index] = board[btn_id[1]][btn_id[2]];
                    selected_word_index++;
                    console.log(selected_word);
                    check_if_correct();
                    if(control.win == board_def.difficulty){
                        win_screen.style.display = 'block';
                    }
                }
                if(control.control_times <= 2){
                    identify_movement(btn_id[1], btn_id[2]);
                    control.control_times++;
                }
            }
        });
    });
}

function reset_everything(rec_dim, rec_difficulty){
    control.control_times = 1;
    control.row0 = '';
    control.col0 = '';
    control.row1 = '';
    control.col1 = '';
    control.type = 'none';
    control.win = 0;

    selected_word = [];
    selected_word_index = 0;

    current_words = [];
    word_list_ = [];

    board_def.dim = rec_dim;
    board_def.difficulty = rec_difficulty;
    
    const spans = board_div.querySelectorAll('span');
    
    spans.forEach(function(span){
        board_div.removeChild(span);
    });

    const word_list = document.querySelector('#words-list');
    const word_span = word_list.querySelectorAll('span');

    word_span.forEach(function(span1){
        word_list.removeChild(span1);
    });

    loadBoard();
    space();
    put_words();
    generate_letters();
    update_board();
    load_words_list();
    console.log(current_words);
}

window.onload = function(){
    loadBoard();
    space();
    put_words();
    generate_letters();
    update_board();
    load_words_list();
    console.warn('If there are any "bugs" then its not a bug, its an experience enhancing feature!');
    console.log(current_words);
}

reset_btn.addEventListener('click', function(){
    reset_everything(board_def.dim, board_def.difficulty);
});

btn_play_again.addEventListener('click', function(){
    win_screen.style.display = 'none';
    reset_everything(board_def.dim, board_def.difficulty);
});

difficulty_btns.forEach(function(btn){
    btn.addEventListener('click', function(){
        if(!btn.classList.contains('selected_btn')){
            difficulty_btns.forEach(function(btn1){
                btn1.classList.remove('selected_btn');
            });
            btn.classList.add('selected_btn');
            if(btn.textContent == 'EASY'){
                reset_everything(11, 4);
            }
            if(btn.textContent == 'MEDIUM'){
                reset_everything(15, 6);
            }
            if(btn.textContent == 'HARD'){
                reset_everything(20, 9);
            }
        }
    });
});