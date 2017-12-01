import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as $ from 'jquery';
import * as ChessBoard from "chessboardjs";
import * as Chess from "chess.js";
@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	public game: any;
	public board: any;
	public captured: string[]=[];
	constructor(public navCtrl: NavController) {
		setTimeout(() => {
			this.game = new Chess()
			this.board = ChessBoard('board1', {
				draggable: true,
				pieceTheme: 'assets/imgs/{piece}.png',
				onDragStart: this.onDragStart,
				onDrop: this.onDrop,
				onSnapEnd: this.onSnapEnd
			});
			this.board.resize();
			this.board.start();

		}, 3000);
	}
	public removeGreySquares = () => {
		$('#board1 .square-55d63').css('background', '');
	};
	public greySquare(square) {
		var squareEl = $('#board1 .square-' + square);

		var background = '#a9a9a9';
		if (squareEl.hasClass('black-3c85d') === true) {
			background = '#696969';
		}

		squareEl.css('background', background);
	};
	public onDragStart = (source, piece, position, orientation) => {
		if ((this.game.turn() === 'w' && piece.search(/^w/) === -1) ||
			(this.game.turn() === 'b' && piece.search(/^b/) === -1)) {
			return false;
		}

		this.removeGreySquares();
		this.onMouseoverSquare(source,piece);
	};
	public onDrop = (source, target) => {
		
		// see if the move is legal
		var move = this.game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});
		if (move !== null && move.captured != undefined) {
			var color = move.color == "b" ? "w" : "b";
			this.captured.push(color + move.captured.toUpperCase())
		}
		// illegal move
		if (move === null) return 'snapback';

		this.updateStatus();
	};
	public updateStatus = () => {
		var status = '';

		var moveColor = 'White';
		if (this.game.turn() === 'b') {
			moveColor = 'Black';
		}

		// checkmate?
		if (this.game.in_checkmate() === true) {
			status = 'Game over, ' + moveColor + ' is in checkmate.';
		}

		// draw?
		else if (this.game.in_draw() === true) {
			status = 'Game over, drawn position';
		}

		// game still on
		else {
			status = moveColor + ' to move';

			// check?
			if (this.game.in_check() === true) {
				status += ', ' + moveColor + ' is in check';
			}
		}
	};
	public onSnapEnd = () => {
		this.board.position(this.game.fen());
	};
	public onMouseoverSquare = (square, piece) => {
		// get list of possible moves for this square
		var moves = this.game.moves({
			square: square,
			verbose: true
		});
		// exit if there are no moves available for this square
		if (moves.length === 0) return;

		// highlight the square they moused over
		this.greySquare(square);

		// highlight the possible squares for this piece
		for (var i = 0; i < moves.length; i++) {
			this.greySquare(moves[i].to);
		}
	};
	
	public onMouseoutSquare = (square, piece) => {
		this.removeGreySquares();
	};
	

}
