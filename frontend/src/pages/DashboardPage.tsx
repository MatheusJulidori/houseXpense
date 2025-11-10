import { memo, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMovements, useDeleteMovement } from '../hooks/useMovements';
import { useTags } from '../hooks/useTags';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LogOut, DollarSign, Plus, Minus, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import logo from '../assets/logo.png';
import MovementsTable from '../components/MovementsTable';
import MovementsFilters from '../components/MovementsFilters';
import TimePeriodPicker, { type TimePeriod } from '../components/TimePeriodPicker';
import AddMovementForm from '../components/AddMovementForm';
import EditMovementForm from '../components/EditMovementForm';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button as UIButton } from '../components/ui/button';
import type { Movement } from '../types/movement.types';
import { toast } from 'sonner';

function DashboardPageComponent() {
  const { user, logout } = useAuth();
  const { data: movements = [], isLoading: movementsLoading } = useMovements();
  const deleteMovementMutation = useDeleteMovement();
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  // Filter states
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [period, setPeriod] = useState<TimePeriod>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Modal states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  // Filter movements based on selected filters
  const filteredMovements = useMemo(() => {
    let filtered = [...movements];

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(movement =>
        movement.tags?.some(tag => selectedTags.includes(tag.id))
      );
    }

    // Filter by selected period (startDate/endDate)
    if (period.startDate && period.endDate) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.date);
        return movementDate >= start && movementDate <= end;
      });
    }

    return filtered;
  }, [movements, selectedTags, period]);

  // Calculate stats
  const stats = useMemo(() => {
    // Filter out movements with "credito" tag (they don't count for monthly totals)
    const movementsForCalculation = filteredMovements.filter(
      movement => !movement.tags?.some(tag => tag.name === 'credito')
    );

    const income = movementsForCalculation
      .filter(m => m.type === 'INCOME')
      .reduce((sum, m) => sum + Number(m.amount), 0);
    const expense = movementsForCalculation
      .filter(m => m.type === 'EXPENSE')
      .reduce((sum, m) => sum + Number(m.amount), 0);
    const balance = income - expense;

    // Calculate investments: movements with "" tag
    // EXPENSE = positive investment (money going into investments)
    // INCOME = negative investment (money coming out of investments)
    const investmentMovements = filteredMovements.filter(
      movement => movement.tags?.some(tag => tag.name.toLowerCase() === 'investimento')
    );
    const investments = investmentMovements.reduce((sum, m) => {
      const amount = Number(m.amount);
      return sum + (m.type === 'EXPENSE' ? amount : -amount);
    }, 0);

    return { income, expense, balance, investments };
  }, [filteredMovements]);

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedMonth('');
    setSelectedYear('');
  };

  const handleAddMovement = () => {
    setIsAddFormOpen(true);
  };

  const handleEditMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsEditFormOpen(true);
  };

  const handleDeleteMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="houseXpense" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  houseXpense
                </h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{user?.username}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {user?.firstName}!
            </h2>
            <p className="text-muted-foreground">
              Gerencie suas finanças de forma simples e eficiente
            </p>
          </div>

          {/* Time Period Picker */}
          <div className="flex justify-center">
            <TimePeriodPicker value={period} onChange={setPeriod} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Investimentos
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.investments >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(stats.investments)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.investments >= 0 ? 'investido' : 'resgatado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receitas
                </CardTitle>
                <Plus className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(stats.income)}
                </div>
                <p className="text-xs text-muted-foreground">
                  total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despesas
                </CardTitle>
                <Minus className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(stats.expense)}
                </div>
                <p className="text-xs text-muted-foreground">
                  total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                  {formatCurrency(stats.balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.balance >= 0 ? 'positivo' : 'negativo'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <MovementsFilters
            tags={tags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onClearFilters={handleClearFilters}
            isLoading={tagsLoading}
          />

          {/* Movements Table */}
          <MovementsTable
            movements={filteredMovements}
            isLoading={movementsLoading}
            onEdit={handleEditMovement}
            onDelete={handleDeleteMovement}
            onAdd={handleAddMovement}
          />
        </div>
      </main>

      {/* Modals */}
      <AddMovementForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />

      <EditMovementForm
        isOpen={isEditFormOpen}
        movement={selectedMovement}
        onClose={() => setIsEditFormOpen(false)}
      />

      {/* Delete confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Tem certeza que deseja excluir a movimentação
            {selectedMovement ? ` "${selectedMovement.description}"` : ''}?
          </div>
          <DialogFooter>
            <UIButton variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</UIButton>
            <UIButton
              className="text-destructive"
              onClick={async () => {
                if (!selectedMovement) return;
                try {
                  await deleteMovementMutation.mutateAsync(selectedMovement.id);
                  setIsDeleteOpen(false);
                  setSelectedMovement(null);
                } catch (e) {
                  console.error('Error deleting movement:', e);
                  toast.error('Erro ao excluir movimentação', {
                    description: 'Tente novamente mais tarde',
                  });
                }
              }}
              disabled={!selectedMovement || deleteMovementMutation.isPending}
            >
              Excluir
            </UIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} JulidoriDev. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default memo(DashboardPageComponent);