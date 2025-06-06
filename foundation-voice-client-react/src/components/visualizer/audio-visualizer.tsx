"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../../utils/utils"
import { useRTVIClientMediaTrack, useRTVIClientEvent } from "@pipecat-ai/client-react"
import { RTVIEvent } from "@think41/foundation-voice-client-js"

interface AudioVisualizerProps {
  participantType?: "bot" | "local"
  barCount?: number
  barGap?: number
  barWidth?: number
  barRadius?: number
  barColor?: string
  barGlowColor?: string
  barMinHeight?: number
  barMaxHeight?: number
  sensitivity?: number
  className?: string
  containerClassName?: string
  // New customization props
  width?: string | number
  height?: string | number
  backgroundColor?: string
  animationSpeed?: number
  animationStyle?: "wave" | "equalizer" | "pulse"
  responsive?: boolean
  visualizerStyle?: "bars" | "circles" | "line"
  glowIntensity?: number
  containerStyle?: React.CSSProperties
  canvasStyle?: React.CSSProperties
}

export const AudioVisualizer = ({
  participantType = "bot",
  barCount = 5,
  barGap = 10,
  barWidth = 40,
  barRadius = 20,
  barColor = "#FFFFFF",
  barGlowColor = "rgba(255, 255, 255, 0.7)",
  barMinHeight = 20,
  barMaxHeight = 100,
  sensitivity = 1.5,
  className,
  containerClassName,
  // Initialize new props with defaults
  width = "100%",
  height = "100%",
  backgroundColor = "transparent",
  animationSpeed = 0.1,
  animationStyle = "wave",
  responsive = true,
  visualizerStyle = "bars",
  glowIntensity = 15,
  containerStyle = {},
  canvasStyle = {},
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null)
  const animationRef = useRef<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [isBotSpeaking, setIsBotSpeaking] = useState(false)

  // Use the Pipecat SDK hook to get the audio track
  const audioTrack = useRTVIClientMediaTrack("audio", participantType)

  // Use RTVI client events for bot speaking
  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    () => {
      console.log("Bot speaking started in visualizer")
      setIsBotSpeaking(true)
    }
  )

  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    () => {
      console.log("Bot speaking ended in visualizer")
      setIsBotSpeaking(false)
    }
  )

  useEffect(() => {
    // Initialize audio context
    const context = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioContext(context)

    const analyserNode = context.createAnalyser()
    analyserNode.fftSize = 1024
    const bufferLength = analyserNode.frequencyBinCount
    const dataArr = new Uint8Array(bufferLength)

    setAnalyser(analyserNode)
    setDataArray(dataArr)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (context.state !== "closed") {
        context.close()
      }
    }
  }, [])

  useEffect(() => {
    if (!audioTrack || !audioContext || !analyser) return

    // Connect to audio track from the Pipecat SDK
    try {
      if (audioTrack) {
        const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]))
        source.connect(analyser)
        setIsActive(true)
      }
    } catch (error) {
      console.error("Error connecting to audio stream:", error)
    }

    return () => {
      setIsActive(false)
    }
  }, [audioTrack, audioContext, analyser])

  useEffect(() => {
    if (!canvasRef.current || !analyser || !dataArray) return 

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Add a time variable for animation
    let animationTime = 0

    const draw = () => {
      // Increment animation time
      animationTime += animationSpeed

      // Set canvas dimensions based on props or container
      if (responsive) {
        // Set canvas dimensions to match container
        const container = canvas.parentElement
        if (container) {
          canvas.width = container.clientWidth
          canvas.height = container.clientHeight
        }
      } else {
        // Set fixed dimensions from props
        canvas.width = typeof width === 'number' ? width : parseInt(width) || 300
        canvas.height = typeof height === 'number' ? height : parseInt(height) || 150
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background if specified
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Calculate bar positions
      const totalWidth = barWidth * barCount + barGap * (barCount - 1)
      const startX = (canvas.width - totalWidth) / 2
      const centerY = canvas.height / 2

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Draw visualization based on selected style
      if (visualizerStyle === "bars") {
        drawBars(ctx, dataArray, startX, centerY, canvas.width, canvas.height, animationTime)
      } else if (visualizerStyle === "circles") {
        drawCircles(ctx, dataArray, canvas.width, canvas.height, animationTime)
      } else if (visualizerStyle === "line") {
        drawLine(ctx, dataArray, canvas.width, canvas.height, animationTime)
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw)
    }

    const drawBars = (
      ctx: CanvasRenderingContext2D, 
      dataArray: Uint8Array, 
      startX: number, 
      centerY: number, 
      canvasWidth: number, 
      canvasHeight: number, 
      animationTime: number
    ) => {
      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Get frequency data for this bar
        const dataIndex = Math.floor(i * (dataArray.length / barCount))
        
        let value = 0
        
        if (participantType === "local") {
          // For local participant, use real audio data
          value = dataArray[dataIndex]
        } else if (participantType === "bot" && isBotSpeaking) {
          // For bot participant when speaking, use animated values based on selected style
          if (animationStyle === "wave") {
            // Create a wave effect with different phases for each bar
            const phase = i / barCount * Math.PI
            // Generate values between 50 and 200 using sine wave
            value = 50 + 150 * Math.abs(Math.sin(animationTime + phase))
          } else if (animationStyle === "equalizer") {
            // Create a more random equalizer effect
            value = 50 + 150 * Math.abs(Math.sin(animationTime * (i + 1) * 0.3))
          } else if (animationStyle === "pulse") {
            // Create a synchronized pulsing effect
            value = 50 + 150 * Math.abs(Math.sin(animationTime))
          }
        } else {
          // When bot is not speaking, use a minimal static height
          value = 10
        }

        // Calculate bar height based on audio data
        const normalizedValue = value / 255 // Normalize to 0-1
        const barHeight = barMinHeight + normalizedValue * (barMaxHeight - barMinHeight) * sensitivity

        // Calculate position
        const x = startX + i * (barWidth + barGap)

        // Draw bar with glow effect
        ctx.save()

        // Add glow effect
        ctx.shadowColor = barGlowColor
        ctx.shadowBlur = glowIntensity

        // Draw rounded bar
        ctx.fillStyle = barColor
        ctx.beginPath()
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, barRadius)
        ctx.fill()

        ctx.restore()
      }
    }

    const drawCircles = (
      ctx: CanvasRenderingContext2D, 
      dataArray: Uint8Array, 
      canvasWidth: number, 
      canvasHeight: number, 
      animationTime: number
    ) => {
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (dataArray.length / barCount))
        
        let value = 0
        
        if (participantType === "local") {
          value = dataArray[dataIndex]
        } else if (participantType === "bot" && isBotSpeaking) {
          if (animationStyle === "wave") {
            const phase = i / barCount * Math.PI * 2
            value = 50 + 150 * Math.abs(Math.sin(animationTime + phase))
          } else if (animationStyle === "equalizer") {
            value = 50 + 150 * Math.abs(Math.sin(animationTime * (i + 1) * 0.3))
          } else if (animationStyle === "pulse") {
            value = 50 + 150 * Math.abs(Math.sin(animationTime))
          }
        } else {
          value = 10
        }
        
        const normalizedValue = value / 255
        const radius = barMinHeight + normalizedValue * (barMaxHeight - barMinHeight) * sensitivity / 2
        
        const angle = (i / barCount) * Math.PI * 2
        const distance = radius * 2
        
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance
        
        ctx.save()
        ctx.shadowColor = barGlowColor
        ctx.shadowBlur = glowIntensity
        ctx.fillStyle = barColor
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const drawLine = (
      ctx: CanvasRenderingContext2D, 
      dataArray: Uint8Array, 
      canvasWidth: number, 
      canvasHeight: number, 
      animationTime: number
    ) => {
      ctx.save()
      ctx.strokeStyle = barColor
      ctx.lineWidth = barWidth / 4
      ctx.shadowColor = barGlowColor
      ctx.shadowBlur = glowIntensity
      ctx.beginPath()
      
      const points = barCount * 2
      
      for (let i = 0; i <= points; i++) {
        const dataIndex = Math.floor(i * (dataArray.length / points))
        
        let value = 0
        
        if (participantType === "local") {
          value = dataArray[dataIndex]
        } else if (participantType === "bot" && isBotSpeaking) {
          if (animationStyle === "wave") {
            const phase = i / points * Math.PI * 4
            value = 50 + 150 * Math.sin(animationTime + phase)
          } else if (animationStyle === "equalizer") {
            value = 50 + 150 * Math.sin(animationTime * (i + 1) * 0.1)
          } else if (animationStyle === "pulse") {
            value = 50 + 150 * Math.sin(animationTime)
          }
        } else {
          value = 10
        }
        
        const normalizedValue = value / 255
        const amplitude = (barMaxHeight - barMinHeight) * sensitivity
        const y = canvasHeight / 2 + normalizedValue * amplitude * (Math.random() > 0.5 ? 1 : -1)
        const x = (canvasWidth / points) * i
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      ctx.restore()
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    analyser,
    dataArray,
    isActive,
    barCount,
    barGap,
    barWidth,
    barRadius,
    barColor,
    barGlowColor,
    barMinHeight,
    barMaxHeight,
    sensitivity,
    isBotSpeaking,
    participantType,
    // Add new dependencies
    width,
    height,
    backgroundColor,
    animationSpeed,
    animationStyle,
    responsive,
    visualizerStyle,
    glowIntensity
  ])

  return (
    <div 
      className={cn("relative", containerClassName)} 
      style={{
        width: width,
        height: height,
        ...containerStyle
      }}
    >
      <div 
        className={cn("w-full h-full rounded-lg overflow-hidden", className)}
        style={{ background: backgroundColor !== "transparent" ? undefined : "black" }}
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full" 
          style={canvasStyle}
        />
      </div>
    </div>
  )
}
