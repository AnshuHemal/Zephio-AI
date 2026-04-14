import React from 'react'
import { TOOL_MODE_ENUM, ToolModeType } from '@/constants/canvas';
import { Button } from '@/components/ui/button';
import { HandIcon, MinusIcon, MousePointer, PlusIcon, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PropsType = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  zoomPercent: number;
  toolMode: ToolModeType;
  setToolMode: (toolMode: ToolModeType) => void;
};

const CanvasControls = ({
  zoomIn,
  zoomOut,
  resetView,
  zoomPercent,
  toolMode,
  setToolMode,
}: PropsType) => {

  return (
    <div
      className="absolute bottom-10 -translate-x-1/2
      left-1/2 flex items-center gap-2 rounded-full border
      bg-card py-1.5 px-4 shadow-md text-foreground
      "
    >
      <div className='flex items-center gap-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className={cn(
                `rounded-full cursor-pointer text-inherit!
                 hover:bg-secondary
                `,
                toolMode === TOOL_MODE_ENUM.SELECT && "bg-secondary"
              )}
              onClick={() => setToolMode(TOOL_MODE_ENUM.SELECT)}
            >
              <MousePointer />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Select (V)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              className={cn(
                `rounded-full cursor-pointer text-inherit!
                 hover:bg-secondary
                `,
                toolMode === TOOL_MODE_ENUM.HAND && "bg-secondary"
              )}
              onClick={() => setToolMode(TOOL_MODE_ENUM.HAND)}
            >
              <HandIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Pan (H)</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-5!" />

      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          className="rounded-full cursor-pointer text-inherit! hover:bg-secondary"
          onClick={() => zoomOut()}
        >
          <MinusIcon />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={resetView}
              className="min-w-10 text-center text-sm hover:text-primary transition-colors cursor-pointer rounded-md px-1 py-0.5 hover:bg-secondary"
            >
              {zoomPercent}%
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Reset view (26%)</TooltipContent>
        </Tooltip>

        <Button
          size="icon-sm"
          variant="ghost"
          className="rounded-full cursor-pointer text-inherit! hover:bg-secondary"
          onClick={() => zoomIn()}
        >
          <PlusIcon />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5!" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className="rounded-full cursor-pointer text-inherit! hover:bg-secondary"
            onClick={resetView}
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Fit to screen</TooltipContent>
      </Tooltip>
    </div>
  )
}

export default CanvasControls