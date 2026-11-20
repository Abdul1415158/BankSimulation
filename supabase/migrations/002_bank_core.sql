-- ============================================================
-- BANKVERSE Database Migration 002: Bank Core Tables
-- ============================================================

-- Banks
CREATE TABLE IF NOT EXISTS public.banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.bank_slots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    bank_type TEXT NOT NULL CHECK (bank_type IN ('retail', 'corporate', 'universal')),
    logo_url TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    simulation_duration_years INT NOT NULL DEFAULT 10,
    initial_strategy TEXT NOT NULL,
    starting_capital NUMERIC(18,2) NOT NULL,
    current_year INT NOT NULL DEFAULT 1,
    current_quarter SMALLINT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'bankrupt', 'completed', 'seized')),
    quarter_processing BOOLEAN NOT NULL DEFAULT false,
    random_seed BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_banks_user ON public.banks(user_id);

ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own banks"
    ON public.banks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own banks"
    ON public.banks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own banks"
    ON public.banks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own banks"
    ON public.banks FOR DELETE USING (user_id = auth.uid());

-- Add FK from bank_slots to banks
ALTER TABLE public.bank_slots
    ADD CONSTRAINT fk_bank_slots_bank
    FOREIGN KEY (bank_id) REFERENCES public.banks(id) ON DELETE SET NULL;

-- Bank Settings
CREATE TABLE IF NOT EXISTS public.bank_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL UNIQUE REFERENCES public.banks(id) ON DELETE CASCADE,
    savings_rate NUMERIC(5,3) NOT NULL DEFAULT 2.000,
    current_account_rate NUMERIC(5,3) NOT NULL DEFAULT 0.100,
    fixed_deposit_rate_1yr NUMERIC(5,3) NOT NULL DEFAULT 3.500,
    fixed_deposit_rate_3yr NUMERIC(5,3) NOT NULL DEFAULT 4.000,
    fixed_deposit_rate_5yr NUMERIC(5,3) NOT NULL DEFAULT 4.500,
    personal_loan_spread INT NOT NULL DEFAULT 400,
    business_loan_spread INT NOT NULL DEFAULT 350,
    mortgage_spread INT NOT NULL DEFAULT 200,
    vehicle_loan_spread INT NOT NULL DEFAULT 300,
    corporate_loan_spread INT NOT NULL DEFAULT 250,
    max_loan_to_value NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    min_credit_score INT NOT NULL DEFAULT 600,
    max_single_exposure NUMERIC(18,2) NOT NULL DEFAULT 5000000.00,
    auto_approve_low_risk BOOLEAN NOT NULL DEFAULT false,
    ai_supervision_level TEXT NOT NULL DEFAULT 'moderate'
        CHECK (ai_supervision_level IN ('minimal', 'moderate', 'strict')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bank settings"
    ON public.bank_settings FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Simulation States (current snapshot)
CREATE TABLE IF NOT EXISTS public.simulation_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL UNIQUE REFERENCES public.banks(id) ON DELETE CASCADE,
    total_assets NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_liabilities NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_equity NUMERIC(18,2) NOT NULL DEFAULT 0,
    cash_reserves NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_deposits NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_loans_outstanding NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_investments NUMERIC(18,2) NOT NULL DEFAULT 0,
    interest_income NUMERIC(18,2) NOT NULL DEFAULT 0,
    interest_expense NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_interest_income NUMERIC(18,2) NOT NULL DEFAULT 0,
    fee_income NUMERIC(18,2) NOT NULL DEFAULT 0,
    operating_expenses NUMERIC(18,2) NOT NULL DEFAULT 0,
    credit_losses NUMERIC(18,2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(18,2) NOT NULL DEFAULT 0,
    liquidity_ratio NUMERIC(8,4) NOT NULL DEFAULT 0,
    capital_adequacy_ratio NUMERIC(8,4) NOT NULL DEFAULT 0,
    npl_ratio NUMERIC(8,4) NOT NULL DEFAULT 0,
    net_interest_margin NUMERIC(8,4) NOT NULL DEFAULT 0,
    return_on_assets NUMERIC(8,4) NOT NULL DEFAULT 0,
    return_on_equity NUMERIC(8,4) NOT NULL DEFAULT 0,
    cost_to_income_ratio NUMERIC(8,4) NOT NULL DEFAULT 0,
    total_employees INT NOT NULL DEFAULT 0,
    total_ai_agents INT NOT NULL DEFAULT 0,
    total_customers INT NOT NULL DEFAULT 0,
    customer_satisfaction NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    fraud_incidents INT NOT NULL DEFAULT 0,
    operational_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    cyber_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    reputation_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.simulation_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own simulation states"
    ON public.simulation_states FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Simulation Quarters (historical)
CREATE TABLE IF NOT EXISTS public.simulation_quarters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    quarter_seed BIGINT NOT NULL,
    snapshot JSONB NOT NULL,
    decisions_summary JSONB,
    events_summary JSONB,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bank_id, year, quarter)
);

CREATE INDEX idx_quarters_bank ON public.simulation_quarters(bank_id, year, quarter);

ALTER TABLE public.simulation_quarters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quarters"
    ON public.simulation_quarters FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Economic Conditions
CREATE TABLE IF NOT EXISTS public.economic_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    gdp_growth NUMERIC(6,3) NOT NULL DEFAULT 2.500,
    inflation_rate NUMERIC(6,3) NOT NULL DEFAULT 2.000,
    central_bank_rate NUMERIC(5,3) NOT NULL DEFAULT 3.000,
    unemployment_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    market_interest_rate NUMERIC(5,3) NOT NULL DEFAULT 4.000,
    consumer_confidence NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    housing_index NUMERIC(8,2) NOT NULL DEFAULT 100.00,
    recession_flag BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (bank_id, year, quarter)
);

ALTER TABLE public.economic_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own economic conditions"
    ON public.economic_conditions FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Competitor Banks
CREATE TABLE IF NOT EXISTS public.competitor_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    competitor_type TEXT NOT NULL,
    market_share NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    deposit_rate NUMERIC(5,3) NOT NULL,
    loan_rate NUMERIC(5,3) NOT NULL,
    customer_satisfaction NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    profitability NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    aggressiveness NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    strategy TEXT NOT NULL DEFAULT 'balanced',
    UNIQUE (bank_id, competitor_name)
);

ALTER TABLE public.competitor_banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own competitors"
    ON public.competitor_banks FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));
