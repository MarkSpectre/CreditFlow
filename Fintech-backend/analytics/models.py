from django.db import models
from django.contrib.auth.models import User

class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business_profile')
    company_name = models.CharField(max_length=255, default='FinFocus Enterprise')
    tax_id = models.CharField(max_length=50, default='27AAACF1234H1Z5')
    industry = models.CharField(max_length=100, default='SaaS & Tech Services')
    annual_revenue = models.FloatField(default=250000.0)
    monthly_cashflow = models.FloatField(default=20000.0)
    
    # Financial metrics for score & forecast modeling
    debt_to_income_ratio = models.FloatField(default=28.5) # e.g. 28.5%
    gst_filing_compliance = models.FloatField(default=98.0) # percentage of on-time filings
    revenue_volatility = models.FloatField(default=4.2) # percentage volatility
    credit_age_years = models.FloatField(default=4.5)
    credit_inquiries = models.IntegerField(default=2)
    avg_payment_delay_days = models.IntegerField(default=12)
    expense_ratio = models.FloatField(default=35.0) # 35%
    
    # Onboarding status & docs
    onboarding_completed = models.BooleanField(default=False)
    uploaded_files_json = models.JSONField(default=list, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.user.email})"


class LoanApplication(models.Model):
    STATUS_CHOICES = [
        ('APPROVED', 'Approved'),
        ('PRE_APPROVED', 'Pre-Approved with Adjustments'),
        ('UNDER_REVIEW', 'Under Review'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loan_applications')
    requested_amount = models.FloatField()
    loan_purpose = models.CharField(max_length=100)
    tenure_months = models.IntegerField()
    collateral_type = models.CharField(max_length=100, default='Unsecured / Business Cashflow')
    collateral_value = models.FloatField(default=0.0)
    monthly_income = models.FloatField()
    existing_emi = models.FloatField(default=0.0)

    # Automated ML Underwriting outputs
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='UNDER_REVIEW')
    approved_amount = models.FloatField(default=0.0)
    interest_rate = models.FloatField(default=10.5)
    monthly_installment = models.FloatField(default=0.0)
    risk_tier = models.CharField(max_length=50, default='Tier B - Moderate Risk')
    underwriting_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)



class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('credit', 'Credit / Income'),
        ('debit', 'Debit / Expense'),
    ]
    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Flagged', 'Flagged'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    txn_id = models.CharField(max_length=50, unique=True)
    date = models.CharField(max_length=50)
    merchant = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.FloatField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Completed')
    payment_method = models.CharField(max_length=100, default='ACH Direct Deposit')
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.txn_id} - {self.merchant} (${self.amount})"
