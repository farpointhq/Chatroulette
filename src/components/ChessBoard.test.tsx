import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChessBoard } from './ChessBoard'
import type { GameState, Move } from '../types/chess'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const startingPositionFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function parseFEN(fen: string): GameState {
  const [placement, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(' ')

  const board: GameState['board'] = Array.from({ length: 8 }, () => Array(8).fill(null))
  const rows = placement.split('/')
  for (let r = 0; r < 8; r++) {
    let c = 0
    for (const ch of rows[r]) {
      if (/\d/.test(ch)) {
        c += parseInt(ch, 10)
      } else {
        const color: 'w' | 'b' = ch === ch.toUpperCase() ? 'w' : 'b'
        const type = ch.toLowerCase() as GameState['board'][number][number] extends infer P
          ? P extends { type: infer T } ? T : never
          : never
        board[r][c] = { color, type }
        c++
      }
    }
  }

  return {
    board,
    activeColor: activeColor as 'w' | 'b',
    castlingRights: {
      w: { kingSide: castling.includes('K'), queenSide: castling.includes('Q') },
      b: { kingSide: castling.includes('k'), queenSide: castling.includes('q') },
    },
    enPassantTarget: enPassant !== '-' ? { row: '87654321'.indexOf(enPassant[1]), col: 'abcdefgh'.indexOf(enPassant[0]) } : null,
    halfmoveClock: parseInt(halfmove, 10),
    fullmoveNumber: parseInt(fullmove, 10),
    lastMove: null,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
  }
}

const defaultGameState = () => parseFEN(startingPositionFEN)

// Convenience to query a square by its algebraic notation (e.g. "e2")
function getSquare(square: string) {
  return screen.getByTestId(`square-${square}`)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChessBoard', () => {
  it('renders an 8×8 board', () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} />)
    expect(screen.getByTestId('chess-board')).toBeInTheDocument()
    expect(screen.getAllByTestId(/^square-/)).toHaveLength(64)
  })

  it('places pieces correctly from the starting position', () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} />)
    // White pieces on rank 1
    expect(getSquare('a1')).toHaveTextContent(/[♖R]/)
    expect(getSquare('b1')).toHaveTextContent(/[♘N]/)
    expect(getSquare('c1')).toHaveTextContent(/[♗B]/)
    expect(getSquare('d1')).toHaveTextContent(/[♕Q]/)
    expect(getSquare('e1')).toHaveTextContent(/[♔K]/)
    // Black pieces on rank 8
    expect(getSquare('a8')).toHaveTextContent(/[♜r]/)
    expect(getSquare('e8')).toHaveTextContent(/[♚k]/)
    // White pawns on rank 2
    expect(getSquare('a2')).toHaveTextContent(/[♙P]/)
    expect(getSquare('e2')).toHaveTextContent(/[♙P]/)
    // Black pawns on rank 7
    expect(getSquare('a7')).toHaveTextContent(/[♟p]/)
    expect(getSquare('e7')).toHaveTextContent(/[♟p]/)
    // Empty squares
    expect(getSquare('e4')).not.toHaveTextContent(/[♔♕♖♗♘♙♚♛♜♝♞♟PRNBQKprnbqk]/)
    expect(getSquare('d5')).not.toHaveTextContent(/[♔♕♖♗♘♙♚♛♜♝♞♟PRNBQKprnbqk]/)
  })

  it('supports click-to-move: selecting a piece then a destination calls onMove', async () => {
    const onMove = vi.fn()
    render(<ChessBoard gameState={defaultGameState()} onMove={onMove} />)

    const e2 = getSquare('e2')
    const e4 = getSquare('e4')

    await userEvent.click(e2)
    await userEvent.click(e4)

    expect(onMove).toHaveBeenCalledOnce()
    const calledWith: Move = onMove.mock.calls[0][0]
    expect(calledWith.from).toEqual({ row: 6, col: 4 }) // e2
    expect(calledWith.to).toEqual({ row: 4, col: 4 })   // e4
  })

  it('highlights legal moves when a piece is selected', async () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} />)

    const e2 = getSquare('e2')
    await userEvent.click(e2)

    const legalMoves = screen.getAllByTestId(/^legal-move-/)
    expect(legalMoves.length).toBeGreaterThan(0)
    expect(legalMoves.some((el) => el.getAttribute('data-testid') === 'legal-move-e4')).toBe(true)
  })

  it('shows last move highlight', () => {
    const gs = defaultGameState()
    gs.lastMove = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } } // e2-e4
    render(<ChessBoard gameState={gs} onMove={vi.fn()} />)

    expect(getSquare('e2')).toHaveAttribute('data-last-move', 'true')
    expect(getSquare('e4')).toHaveAttribute('data-last-move', 'true')
  })

  it('shows check indicator when the king is in check', () => {
    const gs = defaultGameState()
    gs.isCheck = true
    render(<ChessBoard gameState={gs} onMove={vi.fn()} />)

    const kingSquare = getSquare('e1')
    expect(kingSquare).toHaveAttribute('data-check', 'true')
  })

  it('shows checkmate indicator', () => {
    const gs = defaultGameState()
    gs.isCheckmate = true
    render(<ChessBoard gameState={gs} onMove={vi.fn()} />)

    const kingSquare = getSquare('e1')
    expect(kingSquare).toHaveAttribute('data-checkmate', 'true')
    expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument()
  })

  it('shows stalemate indicator', () => {
    const gs = defaultGameState()
    gs.isStalemate = true
    render(<ChessBoard gameState={gs} onMove={vi.fn()} />)

    expect(screen.getByTestId('game-over-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('game-over-overlay')).toHaveTextContent(/stalemate/i)
  })

  it('displays a pawn promotion picker when a pawn reaches the last rank', async () => {
    // Set up a board where a white pawn is one square from promotion
    const gs = parseFEN('8/4P3/8/8/8/8/8/k6K w - - 0 1')
    const onMove = vi.fn()
    render(<ChessBoard gameState={gs} onMove={onMove} />)

    const e7 = getSquare('e7')
    const e8 = getSquare('e8')

    await userEvent.click(e7)
    await userEvent.click(e8)

    expect(screen.getByTestId('promotion-picker')).toBeInTheDocument()
    expect(screen.getByTestId('promote-queen')).toBeInTheDocument()
    expect(screen.getByTestId('promote-rook')).toBeInTheDocument()
    expect(screen.getByTestId('promote-bishop')).toBeInTheDocument()
    expect(screen.getByTestId('promote-knight')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('promote-queen'))

    expect(onMove).toHaveBeenCalledOnce()
    const calledWith: Move = onMove.mock.calls[0][0]
    expect(calledWith.promotion).toBe('q')
  })

  it('flips the board when orientation prop is "b"', () => {
    const gs = defaultGameState()
    const { rerender } = render(<ChessBoard gameState={gs} onMove={vi.fn()} orientation="w" />)

    // White orientation: a1 is bottom-left
    expect(getSquare('a1').compareDocumentPosition(getSquare('h8'))).toBe(4) // a1 precedes h8

    rerender(<ChessBoard gameState={gs} onMove={vi.fn()} orientation="b" />)

    // Black orientation: a1 is top-right
    expect(getSquare('a1').compareDocumentPosition(getSquare('h8'))).toBe(2) // a1 follows h8
  })

  it('shows coordinate notation (a-h, 1-8) around the board', () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} />)

    expect(screen.getByTestId('coord-file-a')).toBeInTheDocument()
    expect(screen.getByTestId('coord-file-h')).toBeInTheDocument()
    expect(screen.getByTestId('coord-rank-1')).toBeInTheDocument()
    expect(screen.getByTestId('coord-rank-8')).toBeInTheDocument()
  })

  it('is responsive and renders within a container', () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} />)
    const board = screen.getByTestId('chess-board')
    expect(board).toHaveStyle({ maxWidth: '100%' })
  })

  it('does not call onMove when clicking an empty square first', async () => {
    const onMove = vi.fn()
    render(<ChessBoard gameState={defaultGameState()} onMove={onMove} />)

    await userEvent.click(getSquare('e4'))
    await userEvent.click(getSquare('e5'))

    expect(onMove).not.toHaveBeenCalled()
  })

  it('allows drag-and-drop to make a move', async () => {
    const onMove = vi.fn()
    render(<ChessBoard gameState={defaultGameState()} onMove={onMove} />)

    const e2 = getSquare('e2')
    const e4 = getSquare('e4')

    fireEvent.dragStart(e2)
    fireEvent.dragOver(e4)
    fireEvent.drop(e4)
    fireEvent.dragEnd(e2)

    expect(onMove).toHaveBeenCalledOnce()
  })

  it('ignores input when interactive is false', async () => {
    const onMove = vi.fn()
    render(<ChessBoard gameState={defaultGameState()} onMove={onMove} interactive={false} />)

    await userEvent.click(getSquare('e2'))
    expect(onMove).not.toHaveBeenCalled()
  })

  it('supports the className prop', () => {
    render(<ChessBoard gameState={defaultGameState()} onMove={vi.fn()} className="my-custom-class" />)
    expect(screen.getByTestId('chess-board')).toHaveClass('my-custom-class')
  })
})
