/**
 * Recommendations List Component
 * Displays recommendations in a sortable list with interactive selection
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Grade as StarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { RecommendationStatsCard, RecommendationsPriorityBadge } from './RecommendationMarkers';

export interface RecommendationItem {
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

interface RecommendationsListProps {
  recommendations: RecommendationItem[];
  loading?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onItemClick?: (recommendation: RecommendationItem, index: number) => void;
  maxSelectable?: number;
}

/**
 * Main recommendations list component
 */
export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  loading = false,
  onSelectionChange,
  onItemClick,
  maxSelectable = 3
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort recommendations by priority then score
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.score - a.score;
  });

  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < maxSelectable) {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedRecommendations.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(
        sortedRecommendations.slice(0, maxSelectable).map((r, i) => r.id || `rec-${i}`)
      );
      setSelectedIds(newSelected);
      onSelectionChange?.(Array.from(newSelected));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nenhuma recomendação disponível. Execute uma análise de cobertura primeiro.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with selection summary */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            ⭐ Recomendações de Torres
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedIds.size} de {maxSelectable} selecionadas
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={handleSelectAll}
          variant={selectedIds.size > 0 ? 'contained' : 'outlined'}
        >
          {selectedIds.size > 0 ? 'Limpar' : 'Selecionar'}
        </Button>
      </Box>

      {/* Recommendations list */}
      <Stack spacing={1.5}>
        {sortedRecommendations.map((rec, index) => {
          const id = rec.id || `rec-${index}`;
          const isSelected = selectedIds.has(id);
          const isExpanded = expandedId === id;

          return (
            <Card
              key={id}
              sx={{
                border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
                backgroundColor: isSelected ? '#e3f2fd' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  backgroundColor: isSelected ? '#e3f2fd' : '#fafafa'
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Main row: checkbox, location, priority, score */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                  }}
                >
                  {/* Checkbox for selection */}
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(id);
                    }}
                    disabled={!isSelected && selectedIds.size >= maxSelectable}
                  />

                  {/* Content */}
                  <Box
                    sx={{ flex: 1 }}
                    onClick={() => {
                      if (onItemClick) onItemClick(rec, index);
                      setExpandedId(isExpanded ? null : id);
                    }}
                  >
                    {/* Location and priority row */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {rec.location.latitude.toFixed(4)}, {rec.location.longitude.toFixed(4)}
                        </Typography>
                      </Box>
                      <RecommendationsPriorityBadge priority={rec.priority} />
                    </Box>

                    {/* Score and stats row */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Chip
                        icon={<StarIcon />}
                        label={`${rec.score.toFixed(2)}/10`}
                        size="small"
                        variant="outlined"
                        color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'success'}
                      />
                      <Chip
                        icon={<PeopleIcon />}
                        label={`~${rec.population_reached.toLocaleString('pt-BR')} pessoas`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${rec.gap_count} gap(s)`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Expanded details */}
                    {isExpanded && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            <strong>Razão:</strong> {rec.reason}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            <InfoIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            Clique para simular cobertura desta torre no mapa
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Helper text */}
      {selectedIds.size > 0 && (
        <Alert severity="success" sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon sx={{ fontSize: 16 }} />
          {selectedIds.size} localização(ões) selecionada(s) para análise de viabilidade.
        </Alert>
      )}
    </Box>
  );
};

/**
 * Recommendations Dialog Component
 * Modal dialog for displaying recommendations
 */
interface RecommendationsDialogProps {
  open: boolean;
  recommendations: RecommendationItem[];
  loading?: boolean;
  totalGapsAnalyzed?: number;
  clusterCount?: number;
  onClose: () => void;
  onSelectRecommendation?: (recommendation: RecommendationItem) => void;
}

export const RecommendationsDialog: React.FC<RecommendationsDialogProps> = ({
  open,
  recommendations,
  loading = false,
  totalGapsAnalyzed = 0,
  clusterCount = 0,
  onClose,
  onSelectRecommendation
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelection = (ids: string[]) => {
    setSelectedIds(new Set(ids));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StarIcon color="warning" />
        Recomendações de Localização para Torres
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        {/* Summary */}
        {(totalGapsAnalyzed > 0 || clusterCount > 0) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="caption">
              <strong>Análise:</strong> {totalGapsAnalyzed} gaps em {clusterCount} cluster(s)
            </Typography>
          </Alert>
        )}

        {/* List */}
        <RecommendationsList
          recommendations={recommendations}
          loading={loading}
          onSelectionChange={handleSelection}
          onItemClick={(rec) => {
            if (onSelectRecommendation) onSelectRecommendation(rec);
          }}
          maxSelectable={3}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button
          onClick={() => {
            onClose();
          }}
          variant="contained"
          disabled={selectedIds.size === 0}
        >
          Simular Cobertura ({selectedIds.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
