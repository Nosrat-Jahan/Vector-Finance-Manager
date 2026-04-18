/* * =============================================================================
 * PROJECT: Vector-Finance-Manager (টাকার হিসাব AI)
 * VERSION: 1.0.1 [Legacy Stable]
 * ORIGINAL BUILD: October 2025
 * DEVELOPER: Nosrat Jahan
 * -----------------------------------------------------------------------------
 * NOTES: Main entry point for the financial intelligence module. 
 * Handles data synchronization and UI state management.
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { LogOut } from "lucide-material";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import TransactionManager from "@/components/TransactionManager";
import BudgetManager from "@/components/BudgetManager";
import SavingsManager from "@/components/SavingsManager";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchTransactions, fetchBudgets, fetchSavingsGoals, type DbTransaction, type DbBudget, type DbSavingsGoal } from "@/lib/financeDb";

const Index = () => {
  const { session, loading: authLoading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [budgets, setBudgets] = useState<DbBudget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<DbSavingsGoal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [tx, b, sg] = await Promise.all([fetchTransactions(), fetchBudgets(), fetchSavingsGoals()]);
      setTransactions(tx);
      setBudgets(b);
      setSavingsGoals(sg);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">💰 টাকার হিসাব</h1>
          <p className="text-sm text-muted-foreground">আপনার আর্থিক AI সহকারী</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={signOut} title="লগআউট">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {dataLoading ? (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto mb-8">
            <Dashboard transactions={transactions} budgets={budgets} savingsGoals={savingsGoals} />
          </div>
          <div className="max-w-4xl mx-auto mb-8">
            <TransactionManager transactions={transactions} onRefresh={loadData} />
          </div>
          <div className="max-w-4xl mx-auto mb-8 grid md:grid-cols-2 gap-4">
            <BudgetManager budgets={budgets} onRefresh={loadData} />
            <SavingsManager savingsGoals={savingsGoals} onRefresh={loadData} />
          </div>
          <FloatingAIAssistant transactions={transactions} budgets={budgets} savingsGoals={savingsGoals} />
        </>
      )}
    </div>
  );
};

export default Index;
