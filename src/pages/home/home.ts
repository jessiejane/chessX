import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
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

	public bCaptured: string[] = [];
	public wCaptured: string[] = [];

	public theme: any;
	public lastMoved: string;

	public jessieWins: number;
	public jessieLosses: number;
	public stalemates: number;

	public wTimer: {
		min: number,
		sec: number
	};
	public bTimer: {
		min: number,
		sec: number
	};
	constructor(public navCtrl: NavController, private storage: Storage) {
		this.jessieWins = 0;
		this.jessieLosses = 0;
		this.stalemates = 0;

		this.game = new Chess()
		this.wTimer = { min: 0, sec: 0 }
		this.bTimer = { min: 0, sec: 0 }
		this.theme = "c"
		setInterval(() => {
			if (this.game.turn() === 'w') {
				if (this.wTimer.sec == 59) {
					this.wTimer.min++;
					this.wTimer.sec = 0;
				}
				this.wTimer.sec++;
			}
			else if (this.game.turn() === 'b') {
				if (this.bTimer.sec == 59) {
					this.bTimer.min++;
					this.bTimer.sec = 0;
				}
				this.bTimer.sec++;
			}

		}, 1000)
	}
	ngOnInit() {
		$('#board1').click((event) => {
			var classes = event.target.className.split(" ");
			if (classes.length == 3) {
				var target = classes[2].split("-")[1];
				this.board.move(this.lastMoved + "-" + target);
				var move = this.game.move({
					from: this.lastMoved,
					to: target,
					promotion: 'q' // NOTE: always promote to a queen for example simplicity
				});
				if (target[1] == '8' && this.game.get(target).color == "w") {
					var piece =this.game.get(target)
					piece.type = "q";
				}
				
				if (target[1] == '1' && this.game.get(target).color == "b") {
					var piece = this.game.get(target);
					piece.type = "q";
				}

				this.removeGreySquares();
				if (this.game.in_check()) {
					alert('in check');
				}
			}
		});
		this.board = ChessBoard('board1', {
			draggable: true,
			pieceTheme: 'assets/imgs/{piece}.png',
			showNotation: false,
			onDragStart: this.onDragStart,
			onDrop: this.onDrop,
			onSnapEnd: this.onSnapEnd
		});
		this.board.resize();
		this.board.start();

	}
	// public onChange(CValue) {
	// 	if (CValue == "h") {
	// 		$('div[class*="black"]').css('background-color', 'rgba(0, 204, 0,.7)');
	// 		$('div[class*="white"]').css('background-color', 'rgba(0, 0, 128,.7)');
	// 		$('#eagle, #seahawk').show();
	// 	}

	// }
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

			this.board.move(this.lastMoved + "-" + source);
			var move = this.game.move({
				from: this.lastMoved,
				to: source,
				promotion: 'q' // NOTE: always promote to a queen for example simplicity
			});
			if (move !== null && move.captured != undefined) {
				var color = move.color == "b" ? "w" : "b";
				if (move.color == "b")
					this.wCaptured.push(color + move.captured.toUpperCase())
				if (move.color == "w")
					this.bCaptured.push(color + move.captured.toUpperCase())
			}
			this.removeGreySquares();

			return false;
		}

		this.removeGreySquares();
		this.onMouseoverSquare(source, piece);
	};
	public onDrop = (source, target) => {
		if (source == target)
			this.lastMoved = source;
		// see if the move is legal
		var move = this.game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});
		if (move !== null && move.captured != undefined) {
			var color = move.color == "b" ? "w" : "b";
			if (move.color == "b")
				this.wCaptured.push(color + move.captured.toUpperCase())
			if (move.color == "w")
				this.bCaptured.push(color + move.captured.toUpperCase())
		}
		// illegal move
		if (move === null) return 'snapback';

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


}
