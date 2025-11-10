import { memo, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Filter, X, Tag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { Tag as TagType } from '../types/tag.types';

interface MovementsFiltersProps {
    tags: TagType[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    selectedMonth: string;
    onMonthChange: (month: string) => void;
    selectedYear: string;
    onYearChange: (year: string) => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

function MovementsFiltersComponent({
    tags,
    selectedTags,
    onTagsChange,
    selectedMonth,
    onMonthChange,
    selectedYear,
    onYearChange,
    onClearFilters,
    isLoading = false
}: MovementsFiltersProps) {
    const [open, setOpen] = useState(false);

    const months = [
        { value: '', label: 'Todos os meses' },
        { value: '01', label: 'Janeiro' },
        { value: '02', label: 'Fevereiro' },
        { value: '03', label: 'Março' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Maio' },
        { value: '06', label: 'Junho' },
        { value: '07', label: 'Julho' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' },
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const handleTagToggle = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter(id => id !== tagId));
        } else {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    const hasActiveFilters = selectedTags.length > 0 || selectedMonth || selectedYear;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </CardTitle>
                    <div className="flex gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-muted-foreground"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Limpar
                            </Button>
                        )}
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    Aplicar filtros
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                                <div className="space-y-4">
                                    {/* Month and Year Filters (optional, kept for compatibility) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="month-filter">Mês</Label>
                                            <Select
                                                value={selectedMonth || undefined}
                                                onValueChange={onMonthChange}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecionar mês" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months
                                                        .filter((m) => m.value !== '')
                                                        .map((month) => (
                                                            <SelectItem key={month.value} value={month.value}>
                                                                {month.label}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="year-filter">Ano</Label>
                                            <Select
                                                value={selectedYear || undefined}
                                                onValueChange={onYearChange}
                                                disabled={isLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecionar ano" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year.toString()}>
                                                            {year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Tags Filter */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Tags
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {isLoading ? (
                                                <div className="flex gap-2">
                                                    {Array.from({ length: 3 }).map((_, i) => (
                                                        <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded" />
                                                    ))}
                                                </div>
                                            ) : tags.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                                            ) : (
                                                tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                                                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                                                        onClick={() => handleTagToggle(tag.id)}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="pt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                            Filtros ativos:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedMonth && (
                                <Badge variant="secondary" className="text-xs">
                                    Mês: {months.find(m => m.value === selectedMonth)?.label}
                                </Badge>
                            )}
                            {selectedYear && (
                                <Badge variant="secondary" className="text-xs">
                                    Ano: {selectedYear}
                                </Badge>
                            )}
                            {selectedTags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                    <Badge key={tagId} variant="secondary" className="text-xs">
                                        {tag.name}
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default memo(MovementsFiltersComponent);
