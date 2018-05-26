var tttBoardSpace = {
	props: [
		'tttTurn', 'tttSpaceNumber', 'tttSpacesClaimed',
		'tttPlayerOneSymbol', 'tttPlayerTwoSymbol', 'tttGameStart'
	],

	template: `
		<div class="tictactoe__space" @click="handleClick">
			<div v-show="player1" class="tictactoe__player-symbol">
				<span>{{ tttPlayerOneSymbol }}</span>
			</div>

			<div v-show="player2" class="tictactoe__player-symbol">
				{{ tttPlayerTwoSymbol }}
			</div>
		</div>
	`,

	data: function() {
		return {
			player1: false,
			player2: false
		}
	},

	watch: {
		tttGameStart() {
			if (this.tttGameStart === true) {
				this.player1 = false;
				this.player2 = false;
			}
		}
	},

	methods: {
		handleClick: function() {
			if (!this.tttSpacesClaimed.includes(this.tttSpaceNumber)) {
				eventHub.$emit('ttt-player-go', { spaceNumber: this.tttSpaceNumber });

				if (this.tttTurn === 'Player 1') {
					this.player1 = true
				}

				if (this.tttTurn === 'Player 2') {
					this.player2 = true
				}
			}
		}
	}
};

var tttBoard = {
	template: `
		<div class="tictactoe__board">
			<div class="card">
				<div class="card-body">
					<p class="card-text">Turn: {{ turn }}</p>
				</div>
			</div>
			
			<h2 class="sr-only">Board</h2>

			<div class="tictactoe__spaces">
				<ttt-board-space
					:ttt-turn="turn"
					v-for="number in spaces"
					:key="number"
					:ttt-space-number="number"
					:ttt-spaces-claimed="totalSpacesClaimed"
					:ttt-player-one-symbol="players.player1.symbol"
					:ttt-player-two-symbol="players.player2.symbol"
					:ttt-game-start="gameStart">
				</ttt-board-space>
			</div>

			<div class="card tictactoe__scoreboard">
				<h2 class="card-header">Scores:</h2>
				<ul class="list-group list-group-flush">
					<li class="list-group-item">Player 1: {{ playerOneDisplayScore }}</li>
					<li class="list-group-item">Player 2: {{ playerTwoDisplayScore }}</li>
				</ul>
			</div>

			<p class="text-center tictactoe__go-home"><a href="/">Return Home</a></p>

			<div v-show="winner" class="tictactoe__winner">
				<div class="tictactoe__winner-content">
					<h2 class="tictactoe__heading2">{{ winner }} wins!</h2>
					<button class="btn game99__btn_primary tictactoe__winner-btn" @click="resetGame">OK, Play Another!</button>
					<a style="background-color: white; color: black;" href="/" class="btn tictactoe__winner-btn">Go Back to Home Screen</a>
				</div>
			</div>
		</div>
	`,

	components: {
		tttBoardSpace: tttBoardSpace
	},

	data: function() {
		return {
			gameStart: true,
			spaces: 9,
			turn: 'Player 1',
			players: {
				player1: {
					points: 0,
					spacesClaimed: [],
					symbol: 'X'
				},
				player2: {
					points: 0,
					spacesClaimed: [],
					symbol: 'O'
				}
			},
			winConditions: [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
				[1, 5, 9],
				[3, 5, 7],
				[1, 4, 7],
				[2, 5, 8],
				[3, 6, 9]
			],
			winner: ''
		}
	},

	computed: {
		totalSpacesClaimed: function() {
			return this.players.player1.spacesClaimed.concat(this.players.player2.spacesClaimed);
		},

		playerOneDisplayScore: function() {
			if (this.players.player1.points > 1) {
				return this.players.player1.points.toString() + ' wins';
			}

			if (this.players.player1.points === 1) {
				return this.players.player1.points.toString() + ' win'
			}

			return 'No wins yet!';
		},

		playerTwoDisplayScore: function() {
			if (this.players.player2.points > 1) {
				return this.players.player2.points.toString() + ' wins';
			}

			if (this.players.player2.points === 1) {
				return this.players.player2.points.toString() + ' win'
			}

			return 'No wins yet!';
		}
	},

	methods: {
		handlePlayerEvent: function(space) {
			this.gameStart = false;
			if (this.turn === 'Player 1') {
				this.players.player1.spacesClaimed.push(space.spaceNumber);
				this.turn = 'Player 2';
			} else if (this.turn === 'Player 2') {
				this.players.player2.spacesClaimed.push(space.spaceNumber);
				this.turn = 'Player 1';
			}

			this.checkWin();
		},

		checkWin: function() {
			var self = this;
			this.players.player1.spacesClaimed.sort();
			this.players.player2.spacesClaimed.sort();

			if (checkWinLoop(this.players.player1.spacesClaimed, this.winConditions)) {
				this.players.player1.points++
				this.winner = 'Player 1';
			} else if (checkWinLoop(this.players.player2.spacesClaimed, this.winConditions)) {
				this.players.player2.points++
				this.winner = 'Player 2';
			} else if (this.totalSpacesClaimed.length === 9) {
				this.winner = 'Nobody';
			}

			function checkWinLoop(playerSpaces, winConditions) {
				for (var i = 0; i < winConditions.length; i++) {
					var playerFilter = [];
					playerFilter[i] = playerSpaces.filter(function(num) {
						return num === winConditions[i][0] ||
							num === winConditions[i][1] ||
							num === winConditions[i][2];
					});
					if (playerFilter[i].length === 3) {
						return true;
					}
				}
			}
		},

		resetGame: function() {
			this.players.player1.spacesClaimed = [];
			this.players.player2.spacesClaimed = [];
			this.turn = 'Player 1';
			this.gameStart = true;
			this.winner = '';
		}
	},

	created: function () {
		eventHub.$on('ttt-player-go', this.handlePlayerEvent);
	},
};

var TicTacToe = {
	template: `
		<div class="tictactoe">
			<h1 class="tictactoe__heading1 game99__game-title">Tic Tac Toe</h1>

			<ttt-board></ttt-board>
		</div>
	`,

	components: {
		tttBoard: tttBoard
	}
};


// This is the event hub we'll use in every
// component to communicate between them.
// https://vuejs.org/v2/guide/migration.html#dispatch-and-broadcast-replaced
var eventHub = new Vue();

var app = new Vue({
	el: '#app',

	components: {
		tictactoe: TicTacToe
	},
});
