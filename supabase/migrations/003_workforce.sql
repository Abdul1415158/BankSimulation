-- ============================================================
-- BANKVERSE Database Migration 003: Workforce Tables
-- ============================================================

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    manager_employee_id UUID,
    monthly_budget NUMERIC(18,2) NOT NULL DEFAULT 0,
    operating_expenses NUMERIC(18,2) NOT NULL DEFAULT 0,
    productivity NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    workload NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    error_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
    performance_score NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    employee_count INT NOT NULL DEFAULT 0,
    ai_agent_count INT NOT NULL DEFAULT 0,
    UNIQUE (bank_id, code)
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own departments"
    ON public.departments FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    salary NUMERIC(12,2) NOT NULL,
    recruitment_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    experience_years INT NOT NULL DEFAULT 0,
    skill_level NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    productivity NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 90.00,
    customer_rating NUMERIC(5,2) NOT NULL DEFAULT 50.00,
    training_level INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'on_leave', 'training', 'terminated', 'resigned')),
    hire_quarter TEXT NOT NULL,
    resignation_probability NUMERIC(5,4) NOT NULL DEFAULT 0.0500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_bank ON public.employees(bank_id);
CREATE INDEX idx_employees_dept ON public.employees(department_id);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own employees"
    ON public.employees FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- Employee History
CREATE TABLE IF NOT EXISTS public.employee_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL
        CHECK (event_type IN ('hired', 'promoted', 'trained', 'transferred',
               'salary_change', 'performance_review', 'resigned', 'terminated')),
    details JSONB,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own employee history"
    ON public.employee_history FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- AI Agents
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    replaced_role TEXT,
    implementation_cost NUMERIC(12,2) NOT NULL,
    quarterly_operating_cost NUMERIC(12,2) NOT NULL,
    maintenance_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    processing_speed NUMERIC(5,2) NOT NULL DEFAULT 90.00,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 85.00,
    error_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0300,
    automation_capacity NUMERIC(5,2) NOT NULL DEFAULT 80.00,
    cyber_risk_factor NUMERIC(5,4) NOT NULL DEFAULT 0.0100,
    supervision_required NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'maintenance', 'malfunctioning', 'decommissioned')),
    malfunction_probability NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
    deployed_quarter TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_agents_bank ON public.ai_agents(bank_id);

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ai agents"
    ON public.ai_agents FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));

-- AI Agent Performance
CREATE TABLE IF NOT EXISTS public.ai_agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    bank_id UUID NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    year INT NOT NULL,
    quarter SMALLINT NOT NULL,
    tasks_completed INT NOT NULL DEFAULT 0,
    errors INT NOT NULL DEFAULT 0,
    downtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
    cost_this_quarter NUMERIC(12,2) NOT NULL DEFAULT 0,
    performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    incidents JSONB,
    UNIQUE (agent_id, year, quarter)
);

ALTER TABLE public.ai_agent_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ai performance"
    ON public.ai_agent_performance FOR ALL
    USING (bank_id IN (SELECT id FROM public.banks WHERE user_id = auth.uid()));
