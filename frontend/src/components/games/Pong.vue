<script setup lang="ts">
import Konva from 'konva'
import type { PongMatch } from '@/types/pong.types'
const emit = defineEmits(['match-state-update'])
const props = defineProps<{ mode: 'match' | 'spectate'; matchId: string }>()

const router = useRouter()
const io = useSocketsStore().create('pong')

const CANVAS_WIDTH = 1400
const CANVAS_HEIGHT = 700
const PADDLE_WIDTH = 30
const PADDLE_HEIGHT = 150
const BALL_RADIUS = 20

function radians_to_degrees(radians: number) {
  var pi = Math.PI
  return radians * (180 / pi)
}

let stage: Konva.Stage | undefined = undefined
let ball: Konva.Circle | undefined = undefined
let leftPaddle: Konva.Rect | undefined = undefined
let rightPaddle: Konva.Rect | undefined = undefined
let leftPlayerScore: Konva.Text | undefined = undefined
let rightPlayerScore: Konva.Text | undefined = undefined

const intelLayer = new Konva.Layer()
const scoreLayer = new Konva.Layer()
const paddlesLayer = new Konva.Layer()
const ballLayer = new Konva.Layer()

let emitedStarting: boolean = false
let emitedOngoing: boolean = false
let emitedFinish: boolean = false
let myPosition: string | undefined

function initCanvas() {
  stage = new Konva.Stage({
    container: 'container',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  })

  const loadingText = new Konva.Text({
    fontStyle: 'bold',
    fill: 'white',
    fontSize: 100,
    align: 'center',
    verticalAlign: 'middle',
    width: stage.width(),
    height: stage.height()
  })

  if (props.mode === 'match') loadingText.text('WAITTING OPPONENT')
  else loadingText.text('JOINING MATCH')

  intelLayer.add(loadingText)

  stage.add(paddlesLayer)
  stage.add(scoreLayer)
  stage.add(ballLayer)
  stage.add(intelLayer)
}

function initGameComponenets(newGameState: PongMatch) {
  const leftPlayer = newGameState.leftPlayer
  const rightPlayer = newGameState.rightPlayer

  // Preserving current player position
  myPosition = newGameState.myPosition

  if (!stage) return

  intelLayer.removeChildren()

  ball = new Konva.Circle({
    x: newGameState.ball.x,
    y: newGameState.ball.y,
    radius: BALL_RADIUS,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2
  })

  ballLayer.add(ball)

  leftPaddle = new Konva.Rect({
    y: leftPlayer.y,
    x: PADDLE_WIDTH,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    offset: {
      x: PADDLE_WIDTH / 2,
      y: PADDLE_HEIGHT / 2
    }
  })

  leftPlayerScore = new Konva.Text({
    x: stage.width() / 2 - 200 - 28,
    y: 15,
    text: '0',
    fontSize: 100,
    fill: 'white'
  })

  paddlesLayer.add(leftPaddle)
  scoreLayer.add(leftPlayerScore)

  rightPaddle = new Konva.Rect({
    y: rightPlayer.y,
    x: CANVAS_WIDTH - PADDLE_WIDTH,
    fill: 'white',
    stroke: 'black',
    strokeWidth: 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    offset: {
      x: PADDLE_WIDTH / 2,
      y: PADDLE_HEIGHT / 2
    }
  })

  rightPlayerScore = new Konva.Text({
    x: stage.width() / 2 + 200 - 28,
    y: 15,
    text: '0',
    fontSize: 100,
    fill: 'white'
  })

  paddlesLayer.add(rightPaddle)
  scoreLayer.add(rightPlayerScore)
}

function updateMatchMsgHandler(newGameState: PongMatch) {
  const leftPlayer = newGameState.leftPlayer
  const rightPlayer = newGameState.rightPlayer
  const ballProps = newGameState.ball

  switch (newGameState.state) {
    case 'starting': {
      if (!emitedStarting) emit('match-state-update', newGameState), (emitedStarting = true)

      initGameComponenets(newGameState)

      if (!stage) return

      const matchCountDownText = new Konva.Text({
        fontStyle: 'bold',
        fill: 'white',
        fontSize: 100,
        width: stage.width(),
        align: 'center'
      })

      matchCountDownText.setPosition({
        x: matchCountDownText.position().x,
        y: stage.height() - matchCountDownText.height() - 50
      })

      intelLayer.add(matchCountDownText)

      const now = new Date().valueOf() - new Date().getTimezoneOffset()

      let timeLeftToStartGame = Math.floor(
        new Date(newGameState?.startDate as string).valueOf() - now
      )
      let handler: number
      let counter = Math.floor(timeLeftToStartGame / 1000)

      // Countdown
      handler = window.setInterval(() => {
        if (!stage) return

        matchCountDownText.text(`MATCH STARTS IN ${counter}`)

        if (counter > 0) counter--
      }, 1000)

      setTimeout(() => {
        clearInterval(handler)
        intelLayer.visible(false)
      }, timeLeftToStartGame)

      break
    }
    case 'ongoing': {
      if (!emitedOngoing) emit('match-state-update', newGameState), (emitedOngoing = true)

      // Intialize Game Component before updating their state
      // this only happens when a client is in spectating mode
      if (props.mode == 'spectate' && emitedStarting == false) {
        initGameComponenets(newGameState)
        emitedStarting = true
      }

      if (!ball || !stage || !leftPaddle || !rightPaddle || !leftPlayerScore || !rightPlayerScore)
        return

      ball.setPosition({
        x: ballProps.x,
        y: ballProps.y
      })

      if (leftPlayerScore.text() != leftPlayer.goals.toString()) {
        leftPlayerScore.text(leftPlayer.goals.toString())
        leftPlayerScore.setPosition({
          x: stage.width() / 2 - 200 - leftPlayerScore.width() / 2,
          y: 15
        })
      } else if (rightPlayerScore.text() != rightPlayer.goals.toString()) {
        rightPlayerScore.text(rightPlayer.goals.toString())
        rightPlayerScore.setPosition({
          x: stage.width() / 2 + 200 - rightPlayerScore.width() / 2,
          y: 15
        })
      }

      leftPaddle.rotate(radians_to_degrees(leftPlayer.angle) - leftPaddle.rotation())
      rightPaddle.rotate(radians_to_degrees(rightPlayer.angle) - rightPaddle.rotation())

      leftPaddle.setPosition({
        x: leftPaddle.getPosition().x,
        y: leftPlayer.y
      })

      rightPaddle.setPosition({
        x: rightPaddle.getPosition().x,
        y: rightPlayer.y
      })

      break
    }
    case 'finished': {
      if (!emitedFinish) emit('match-state-update', newGameState), (emitedFinish = true)

      if (!stage) return

      stage.removeChildren()
      stage.clear()

      const message = new Konva.Text({
        fontStyle: 'bold',
        fill: 'white',
        fontSize: 140,
        width: stage.width(),
        height: stage.height(),
        align: 'center',
        verticalAlign: 'middle'
      })

      switch (props.mode) {
        case 'match': {
          const me = myPosition == 'left' ? newGameState.leftPlayer : newGameState.rightPlayer

          if (newGameState.endCause === 'opLeft') useGameStore().setGameStatus('DRAW')
          else if (newGameState.endCause === 'timeout') useGameStore().setGameStatus('TIMEOUT')
          else if (newGameState.endCause === 'win') {
            if (me.winner === true) useGameStore().setGameStatus('VICTORY')
            else useGameStore().setGameStatus('DEFEAT')
          } else useGameStore().setGameStatus('ERROR')

          router.push({ name: 'pongOver' })
          break
        }

        case 'spectate': {
          message.text('MATCH ENDED')
          break
        }
      }

      intelLayer.removeChildren()
      intelLayer.clear()
      intelLayer.add(message)
      intelLayer.visible(true)

      stage.add(intelLayer)

      break
    }
  }
}

function keydownHandler(event: KeyboardEvent) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': {
      // Go Up
      io.socket.emit('update:match', { op: 'up' })
      break
    }
    case 'ArrowDown':
    case 'KeyS': {
      // Go Down
      io.socket.emit('update:match', { op: 'down' })
      break
    }
    case 'ArrowLeft':
    case 'KeyA': {
      // Rotate Left
      io.socket.emit('update:match', { op: 'rleft' })
      break
    }
    case 'ArrowRight':
    case 'KeyD': {
      // Rotate Right
      io.socket.emit('update:match', { op: 'rright' })
      break
    }
  }
}

onBeforeMount(async () => {
  if (props.mode === 'match') {
    document.addEventListener('keydown', keydownHandler)
    io.socket.emit('update:player', { state: 'ready' })
  }

  if (props.mode === 'spectate') io.socket.emit('add:spectator', { matchId: props.matchId })

  io.socket.on('update:match', updateMatchMsgHandler)
})

onMounted(() => {
  initCanvas()
})

onUnmounted(async () => {
  if (props.mode === 'match') document.removeEventListener('keydown', keydownHandler)

  if (props.mode === 'spectate') io.socket.emit('remove:spectator', { matchId: props.matchId })

  io.socket.off('update:match', updateMatchMsgHandler)
})
</script>

<template>
  <div id="container"></div>
</template>

<style>
.container {
  background-color: black;
}
</style>
