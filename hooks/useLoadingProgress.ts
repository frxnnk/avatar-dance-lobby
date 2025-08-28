'use client';

import { useState, useCallback, useRef } from 'react';

interface LoadingStage {
  name: string;
  weight: number; // Peso relativo de esta etapa (0-100)
}

const LOADING_STAGES: LoadingStage[] = [
  { name: 'Initializing dance system', weight: 10 },
  { name: 'Loading 3D avatar', weight: 30 },
  { name: 'Preparing dance animations', weight: 50 },
  { name: 'Setting up dance floor', weight: 10 }
];

export function useLoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  const stageProgress = useRef<Record<string, number>>({});

  const updateStageProgress = useCallback((stageName: string, progressValue: number) => {
    // Actualizar el progreso de la etapa específica
    stageProgress.current[stageName] = Math.max(0, Math.min(100, progressValue));
    
    // Calcular el progreso total basado en los pesos
    let totalProgress = 0;
    let totalWeight = 0;
    
    LOADING_STAGES.forEach(stage => {
      const stageProgressValue = stageProgress.current[stage.name] || 0;
      totalProgress += (stageProgressValue / 100) * stage.weight;
      totalWeight += stage.weight;
    });
    
    const finalProgress = totalWeight > 0 ? (totalProgress / totalWeight) * 100 : 0;
    setProgress(Math.round(finalProgress));
  }, []);

  const setLoadingStage = useCallback((stageName: string) => {
    setCurrentTask(stageName);
  }, []);

  const completeStage = useCallback((stageName: string) => {
    updateStageProgress(stageName, 100);
  }, [updateStageProgress]);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 500); // Pequeña pausa para mostrar 100%
  }, []);

  const resetLoading = useCallback(() => {
    setProgress(0);
    setCurrentTask('Loading...');
    setIsLoading(true);
    stageProgress.current = {};
  }, []);

  return {
    progress,
    currentTask,
    isLoading,
    updateStageProgress,
    setLoadingStage,
    completeStage,
    finishLoading,
    resetLoading
  };
}