-- ============================================================
-- BANKVERSE Database Migration 004: Customers, Deposits, Loans
-- ============================================================

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    customer_type TEXT NOT NULL
        CHECK (customer_type IN ('individual', 'small_business', 'medium_business', 'corporate')),
    name TEXT NOT NULL,
    credit_score INT NOT NULL DEFAULT 700 CHECK (credit_score BETWEEN 300 AND 850),
    risk_category TEXT NOT NULL DEFAULT 'medium'
        CHECK (risk_category IN ('low', 'medium', 'high', 'very_high')),
    annual_income NUMERIC(18,2) NOT NULL DEFAULT 0,
    existing_debt NUMERIC(18,2) NOT NULL DEFAULT 0,
    satisfaction_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_quarter TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_bank ON public.customers(bank_id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own customers"
    ON public.customers FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Customer Accounts
CREATE TABLE IF NOT EXISTS public.customer_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL
        CHECK (account_type IN ('savings', 'current', 'fixed_deposit')),
    balance NUMERIC(18,2) NOT NULL DEFAULT 0,
    interest_rate NUMERIC(5,3) NOT NULL DEFAULT 0,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    maturity_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'dormant', 'closed'))
);

ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own customer accounts"
    ON public.customer_accounts FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Deposits
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    account_id UUID REFERENCES public.customer_accounts(id) ON DELETE SET NULL,
    deposit_type TEXT NOT NULL
        CHECK (deposit_type IN ('savings', 'current', 'fixed_1yr', 'fixed_3yr', 'fixed_5yr')),
    principal NUMERIC(18,2) NOT NULL,
    interest_rate NUMERIC(5,3) NOT NULL,
    accrued_interest NUMERIC(18,2) NOT NULL DEFAULT 0,
    maturity_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'matured', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposits_bank ON public.deposits(bank_id);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own deposits"
    ON public.deposits FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Loans
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL
        CHECK (loan_type IN ('personal', 'business', 'mortgage', 'vehicle', 'corporate')),
    requested_amount NUMERIC(18,2) NOT NULL,
    approved_amount NUMERIC(18,2),
    interest_rate NUMERIC(5,3) NOT NULL,
    duration_quarters INT NOT NULL,
    collateral_value NUMERIC(18,2) DEFAULT 0,
    credit_score_at_origination INT NOT NULL,
    debt_to_income NUMERIC(5,2),
    default_probability NUMERIC(5,4) NOT NULL DEFAULT 0,
    risk_category TEXT NOT NULL DEFAULT 'medium',
    ai_assessment JSONB,
    human_assessment TEXT,
    outstanding_principal NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_interest_paid NUMERIC(18,2) NOT NULL DEFAULT 0,
    quarters_overdue INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'active',
               'overdue', 'defaulted', 'restructured', 'paid_off')),
    npl_stage SMALLINT NOT NULL DEFAULT 0 CHECK (npl_stage BETWEEN 0 AND 3),
    approved_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loans_bank ON public.loans(bank_id);
CREATE INDEX idx_loans_status ON public.loans(bank_id, status);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own loans"
    ON public.loans FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Loan Payments
CREATE TABLE IF NOT EXISTS public.loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    principal_payment NUMERIC(18,2) NOT NULL,
    interest_payment NUMERIC(18,2) NOT NULL,
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    payment_status TEXT NOT NULL DEFAULT 'paid'
        CHECK (payment_status IN ('paid', 'partial', 'missed', 'written_off'))
);

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own loan payments"
    ON public.loan_payments FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Investments
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    investment_type TEXT NOT NULL
        CHECK (investment_type IN ('government_bonds', 'corporate_bonds',
               'interbank_lending', 'central_bank_deposits')),
    principal NUMERIC(18,2) NOT NULL,
    yield_rate NUMERIC(5,3) NOT NULL,
    maturity_date TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'matured', 'sold')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own investments"
    ON public.investments FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Transactions (double-entry ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    transaction_type TEXT NOT NULL,
    debit_account TEXT NOT NULL,
    credit_account TEXT NOT NULL,
    amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_bank_quarter
    ON public.transactions(bank_id, year, quarter);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions"
    ON public.transactions FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Crisis Events
CREATE TABLE IF NOT EXISTS public.crisis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    quarter_id UUID REFERENCES public.simulation_quarters(id),
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    event_category TEXT NOT NULL
        CHECK (event_category IN ('financial', 'operational', 'reputational')),
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_departments TEXT[] NOT NULL DEFAULT '{}',
    immediate_financial_impact NUMERIC(18,2) NOT NULL DEFAULT 0,
    ongoing_quarterly_impact NUMERIC(18,2) NOT NULL DEFAULT 0,
    impact_duration_quarters INT NOT NULL DEFAULT 1,
    reputation_impact NUMERIC(5,2) NOT NULL DEFAULT 0,
    customer_satisfaction_impact NUMERIC(5,2) NOT NULL DEFAULT 0,
    response_options JSONB NOT NULL DEFAULT '[]',
    chosen_response JSONB,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'responded', 'resolved', 'escalated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_crisis_bank ON public.crisis_events(bank_id, year, quarter);

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own crisis events"
    ON public.crisis_events FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Management Decisions
CREATE TABLE IF NOT EXISTS public.management_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    decision_type TEXT NOT NULL,
    decision_data JSONB NOT NULL,
    outcome JSONB,
    quality_score NUMERIC(5,2),
    financial_impact NUMERIC(18,2),
    operational_impact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decisions_bank ON public.management_decisions(bank_id, year, quarter);

ALTER TABLE public.management_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own decisions"
    ON public.management_decisions FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Quarterly Reports
CREATE TABLE IF NOT EXISTS public.quarterly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    financial_report JSONB NOT NULL,
    workforce_report JSONB NOT NULL,
    operational_report JSONB NOT NULL,
    risk_report JSONB NOT NULL,
    management_performance JSONB NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    UNIQUE (bank_id, year, quarter)
);

ALTER TABLE public.quarterly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own quarterly reports"
    ON public.quarterly_reports FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Annual Reports
CREATE TABLE IF NOT EXISTS public.annual_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    consolidated_report JSONB NOT NULL,
    year_over_year_comparison JSONB,
    overall_score NUMERIC(5,2) NOT NULL,
    UNIQUE (bank_id, year)
);

ALTER TABLE public.annual_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own annual reports"
    ON public.annual_reports FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_bank ON public.audit_logs(bank_id, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own audit logs"
    ON public.audit_logs FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));
