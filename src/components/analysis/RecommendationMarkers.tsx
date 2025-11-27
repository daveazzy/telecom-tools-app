/**
 * Recommendation Markers Component
 * Renders tower placement recommendations on the map with special star icons
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Box, Chip, Stack } from '@mui/material';
import { Grade as StarIcon } from '@mui/icons-material';

export interface RecommendationMarker {
  id?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  score: number;
  priority: 'high' | 'medium' | 'low';
  population_reached: number;
  reason: string;
  gap_count: number;
}

interface RecommendationMarkersProps {
  recommendations: RecommendationMarker[];
  map: L.Map | null;
  selectedRecommendationId?: string;
  onMarkerClick?: (recommendation: RecommendationMarker, marker: L.Marker) => void;
}

/**
 * Custom Leaflet icon for recommendations
 * Uses a star symbol with color based on priority
 */
const createRecommendationIcon = (priority: 'high' | 'medium' | 'low') => {
  const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
    high: {
      bg: '#FFD700',      // Gold
      text: '#000000',    // Black text
      border: '#FFA500'   // Orange border
    },
    medium: {
      bg: '#FFA500',      // Orange
      text: '#FFFFFF',    // White text
      border: '#FF8C00'   // Dark Orange border
    },
    low: {
      bg: '#FFB6C1',      // Light pink
      text: '#000000',    // Black text
      border: '#FF69B4'   // Hot pink border
    }
  };

  const colors = priorityColors[priority];

  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Star shape for recommendation -->
        <polygon points="20,2 25,15 39,15 28,24 33,37 20,28 7,37 12,24 1,15 15,15" 
                 fill="${colors.bg}" 
                 stroke="${colors.border}" 
                 stroke-width="1.5"
                 filter="url(#shadow)"/>
        <!-- Center dot for emphasis -->
        <circle cx="20" cy="18" r="2.5" fill="${colors.text}"/>
      </g>
    </svg>
  `;

  return new L.DivIcon({
    html: svg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'recommendation-marker'
  });
};

/**
 * Create popup content for recommendation marker
 */
const createPopupContent = (recommendation: RecommendationMarker): string => {
  const priorityLabel = {
    high: 'Alta Prioridade 🔴',
    medium: 'Média Prioridade 🟡',
    low: 'Baixa Prioridade 🟢'
  }[recommendation.priority];

  return `
    <div style="font-family: Arial, sans-serif; padding: 8px; max-width: 200px;">
      <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
        ⭐ Torre Recomendada
      </div>
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>Score:</strong> ${recommendation.score.toFixed(2)}/10
      </div>
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>Prioridade:</strong> ${priorityLabel}
      </div>
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>População:</strong> ~${recommendation.population_reached.toLocaleString('pt-BR')}
      </div>
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>Motivo:</strong> ${recommendation.reason}
      </div>
      <div style="font-size: 12px; color: #666;">
        <strong>Local:</strong> ${recommendation.location.latitude.toFixed(4)}, ${recommendation.location.longitude.toFixed(4)}
      </div>
    </div>
  `;
};

/**
 * RecommendationMarkers Component
 * Manages rendering of recommendation markers on Leaflet map
 */
export const RecommendationMarkers: React.FC<RecommendationMarkersProps> = ({
  recommendations,
  map,
  selectedRecommendationId,
  onMarkerClick
}) => {
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const mapRef = useRef(map);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => {
      currentMap.removeLayer(marker);
    });
    markersRef.current.clear();

    // Add markers for all recommendations
    recommendations.forEach((rec, index) => {
      const id = rec.id || `rec-${index}`;
      const marker = L.marker(
        [rec.location.latitude, rec.location.longitude],
        {
          icon: createRecommendationIcon(rec.priority),
          title: `Torre Recomendada - ${rec.priority.toUpperCase()}`
        }
      );

      // Add popup
      marker.bindPopup(createPopupContent(rec), {
        maxWidth: 220,
        minWidth: 200
      });

      // Handle marker click
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(rec, marker);
        }
        marker.openPopup();
      });

      // Add to map
      marker.addTo(currentMap);
      markersRef.current.set(id, marker);
    });

    // Clean up on unmount
    return () => {
      markersRef.current.forEach((marker) => {
        if (currentMap) {
          currentMap.removeLayer(marker);
        }
      });
      markersRef.current.clear();
    };
  }, [recommendations, onMarkerClick]);

  return null; // This component only manages map rendering
};

/**
 * RecommendationsPriorityBadge Component
 * Display priority level with appropriate styling
 */
export const RecommendationsPriorityBadge: React.FC<{
  priority: 'high' | 'medium' | 'low';
}> = ({ priority }) => {
  const priorityConfig = {
    high: {
      label: 'ALTA',
      color: 'error' as const,
      icon: '🔴'
    },
    medium: {
      label: 'MÉDIA',
      color: 'warning' as const,
      icon: '🟡'
    },
    low: {
      label: 'BAIXA',
      color: 'success' as const,
      icon: '🟢'
    }
  };

  const config = priorityConfig[priority];

  return (
    <Chip
      icon={<StarIcon sx={{ fontSize: 16 }} />}
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
    />
  );
};

/**
 * RecommendationStatsCard Component
 * Display statistics for a recommendation
 */
export const RecommendationStatsCard: React.FC<{
  recommendation: RecommendationMarker;
}> = ({ recommendation }) => {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#fafafa',
        marginBottom: 1
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ fontSize: 14, fontWeight: 'bold' }}>
            📍 {recommendation.location.latitude.toFixed(4)}, {recommendation.location.longitude.toFixed(4)}
          </Box>
          <RecommendationsPriorityBadge priority={recommendation.priority} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: 12 }}>
          <Box>
            <strong>Score:</strong> {recommendation.score.toFixed(2)}/10
          </Box>
          <Box>
            <strong>Gaps:</strong> {recommendation.gap_count}
          </Box>
          <Box>
            <strong>População:</strong> ~{recommendation.population_reached.toLocaleString('pt-BR')}
          </Box>
          <Box>
            <strong>Razão:</strong> {recommendation.reason}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
