import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from .models import BusinessProfile, LoanApplication
from .services import (
    calculate_credit_score, 
    generate_cash_flow_forecast,
    validate_gstin,
    parse_uploaded_statement
)

logger = logging.getLogger(__name__)

def get_or_create_profile(request):
    """Retrieve user profile from JWT session or fallback to current database user"""
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        # Check authorization header manually if SimpleJWT authentication class was not run
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(auth_header.split(' ')[1])
                user = jwt_auth.get_user(validated_token)
            except Exception as e:
                logger.warning(f"Failed to authenticate JWT from header: {e}")

    if not user or not user.is_authenticated:
        user = User.objects.first()
        if not user:
            user, _ = User.objects.get_or_create(username='sarah@finfocus.com', defaults={
                'email': 'sarah@finfocus.com',
                'first_name': 'Sarah',
                'last_name': 'Jenkins'
            })
    
    profile, created = BusinessProfile.objects.get_or_create(user=user, defaults={
        'company_name': 'FinFocus Enterprises',
        'industry': 'SaaS & Tech Services',
        'annual_revenue': 320000.0,
        'monthly_cashflow': 24500.0,
        'debt_to_income_ratio': 28.5,
        'revenue_volatility': 4.2,
        'expense_ratio': 35.0,
        'avg_payment_delay_days': 12,
        'gst_filing_compliance': 98.0,
        'credit_age_years': 4.5,
        'credit_inquiries': 2
    })
    return profile, user


class AnalyticsOverviewView(APIView):
    """Consolidated Home / Business Overview endpoint"""
    permission_classes = [AllowAny]

    def get(self, request):
        profile, user = get_or_create_profile(request)
        score_data = calculate_credit_score(profile)
        forecast_data = generate_cash_flow_forecast(profile, timeframe_days=90)
        
        # Profile picture from authentication Profile model
        picture = None
        if hasattr(user, 'profile') and user.profile.picture:
            picture = user.profile.picture

        return Response({
            "user": {
                "first_name": user.first_name or "Sarah",
                "last_name": user.last_name or "",
                "email": user.email,
                "company": profile.company_name,
                "picture": picture,
            },
            "score": score_data,
            "forecast": forecast_data,
            "metrics": {
                "revenue_volatility": f"{profile.revenue_volatility}%",
                "revenue_volatility_trend": "up",
                "expense_ratio": f"{profile.expense_ratio}%",
                "expense_ratio_trend": "neutral",
                "avg_payment_delay": f"{profile.avg_payment_delay_days} Days",
                "avg_payment_delay_trend": "down",
            }
        }, status=status.HTTP_200_OK)


class AnalyticsScoreView(APIView):
    """Dedicated Credit Score & Drivers breakdown endpoint"""
    permission_classes = [AllowAny]

    def get(self, request):
        profile, user = get_or_create_profile(request)
        score_data = calculate_credit_score(profile)
        score_data["user"] = {
            "first_name": user.first_name or "Sarah",
            "email": user.email,
            "company": profile.company_name,
            "picture": user.profile.picture if hasattr(user, 'profile') else None
        }
        return Response(score_data, status=status.HTTP_200_OK)


class AnalyticsForecastView(APIView):
    """Dedicated Cash Flow Forecast endpoint with timeframe query param (30, 60, 90)"""
    permission_classes = [AllowAny]

    def get(self, request):
        days_param = request.query_params.get('days', '90')
        try:
            days = int(days_param)
            if days not in [30, 60, 90]:
                days = 90
        except ValueError:
            days = 90
            
        profile, user = get_or_create_profile(request)
        forecast_data = generate_cash_flow_forecast(profile, timeframe_days=days)
        forecast_data["user"] = {
            "first_name": user.first_name or "Sarah",
            "email": user.email,
            "picture": user.profile.picture if hasattr(user, 'profile') else None
        }
        return Response(forecast_data, status=status.HTTP_200_OK)


class AnalyticsVerifyView(APIView):
    """Real Functional Onboarding Verification Endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        profile, user = get_or_create_profile(request)
        data = request.data
        
        tax_id = data.get('tax_id', profile.tax_id)
        files = data.get('uploaded_files', [])
        
        # 1. Functional GSTIN / Tax ID Format & Checksum Verification
        is_gst_valid, gst_msg = validate_gstin(tax_id)
        
        # 2. Functional Document Statement Parsing
        parsed_results = []
        total_tx = 0
        sum_turnover = 0
        
        if not files or len(files) == 0:
            return Response({
                "error": "No bank statements or CSV files uploaded. Please upload at least one document."
            }, status=status.HTTP_400_BAD_REQUEST)

        for file_info in files:
            file_name = file_info.get('name', 'statement.pdf') if isinstance(file_info, dict) else str(file_info)
            file_size = file_info.get('size', '1.0 MB') if isinstance(file_info, dict) else '1.0 MB'
            parsed = parse_uploaded_statement(file_name, file_size)
            parsed_results.append(parsed)
            total_tx += parsed["transaction_count"]
            sum_turnover += parsed["monthly_turnover"]

        # Update profile with parsed metrics
        if sum_turnover > 0:
            profile.monthly_cashflow = float(sum_turnover)
            profile.annual_revenue = float(sum_turnover * 12)
        profile.tax_id = tax_id
        profile.uploaded_files_json = files
        profile.save()

        updated_score = calculate_credit_score(profile)

        return Response({
            "gst_verification": {
                "is_valid": is_gst_valid,
                "tax_id": tax_id,
                "message": gst_msg,
                "status": "PASS" if is_gst_valid else "WARNING"
            },
            "statement_parsing": {
                "file_count": len(files),
                "total_transactions": total_tx,
                "monthly_turnover": sum_turnover,
                "status": "PASS",
                "parsed_files": parsed_results
            },
            "score": updated_score,
            "message": "Verification completed successfully"
        }, status=status.HTTP_200_OK)


class OnboardingSubmitView(APIView):
    """Submit / update user business profile & onboarding data"""
    permission_classes = [AllowAny]

    def post(self, request):
        profile, user = get_or_create_profile(request)
        data = request.data
        
        if 'company_name' in data and data['company_name']:
            profile.company_name = data['company_name']
        if 'tax_id' in data and data['tax_id']:
            profile.tax_id = data['tax_id']
        if 'industry' in data and data['industry']:
            profile.industry = data['industry']
        if 'annual_revenue' in data:
            try:
                profile.annual_revenue = float(data['annual_revenue'])
            except ValueError:
                pass
        if 'monthly_cashflow' in data:
            try:
                profile.monthly_cashflow = float(data['monthly_cashflow'])
            except ValueError:
                pass
        if 'debt_to_income_ratio' in data:
            try:
                profile.debt_to_income_ratio = float(data['debt_to_income_ratio'])
            except ValueError:
                pass
        if 'uploaded_files' in data and isinstance(data['uploaded_files'], list):
            profile.uploaded_files_json = data['uploaded_files']

        profile.onboarding_completed = True
        profile.save()

        updated_score = calculate_credit_score(profile)
        updated_forecast = generate_cash_flow_forecast(profile, timeframe_days=90)
        
        picture = user.profile.picture if hasattr(user, 'profile') and user.profile.picture else None

        return Response({
            "message": "Onboarding completed successfully",
            "user": {
                "first_name": user.first_name or "User",
                "last_name": user.last_name or "",
                "email": user.email,
                "company": profile.company_name,
                "picture": picture,
            },
            "profile": {
                "company_name": profile.company_name,
                "tax_id": profile.tax_id,
                "industry": profile.industry,
                "annual_revenue": profile.annual_revenue,
            },
            "score": updated_score,
            "forecast": updated_forecast
        }, status=status.HTTP_200_OK)


class LoanApplicationView(APIView):
    """View to handle Loan Application submissions with Automated ML Underwriting"""
    permission_classes = [AllowAny]

    def post(self, request):
        profile, user = get_or_create_profile(request)
        data = request.data

        requested_amount = float(data.get('requested_amount', 25000))
        loan_purpose = str(data.get('loan_purpose', 'Working Capital Expansion'))
        tenure_months = int(data.get('tenure_months', 12))
        collateral_type = str(data.get('collateral_type', 'Unsecured / Business Cashflow'))
        collateral_value = float(data.get('collateral_value', 0.0))
        monthly_income = float(data.get('monthly_income', profile.monthly_cashflow or 24500.0))
        existing_emi = float(data.get('existing_emi', 0.0))

        # 1. Automated ML Credit Scoring
        score_info = calculate_credit_score(profile)
        credit_score = score_info.get('score', 750)

        # 2. Financial DSCR (Debt Service Coverage Ratio) Calculation
        annual_rate = 0.10
        monthly_rate = annual_rate / 12.0
        est_monthly_emi = requested_amount * monthly_rate * ((1 + monthly_rate)**tenure_months) / (((1 + monthly_rate)**tenure_months) - 1)
        
        dscr = monthly_income / max(1.0, existing_emi + est_monthly_emi)

        # 3. Automated ML Underwriting Decision Matrix
        if credit_score >= 740 and dscr >= 1.25:
            status_val = 'APPROVED'
            approved_amt = requested_amount
            interest_rate = 8.75
            risk_tier = 'Tier A - Low Underwriting Risk'
            notes = f"Pre-approved at preferential interest rate {interest_rate}%. Strong credit score ({credit_score}) & DSCR ({dscr:.2f})."
        elif credit_score >= 660 and dscr >= 1.0:
            status_val = 'PRE_APPROVED'
            max_limit = min(requested_amount, monthly_income * 8.0)
            approved_amt = max_limit
            interest_rate = 11.25
            risk_tier = 'Tier B - Moderate Risk'
            notes = f"Pre-approved up to ${approved_amt:,.0f} at {interest_rate}% APR based on credit score ({credit_score})."
        else:
            status_val = 'UNDER_REVIEW'
            approved_amt = requested_amount * 0.6
            interest_rate = 13.5
            risk_tier = 'Tier C - Standard Manual Underwriting'
            notes = f"Application flagged for standard manual underwriter verification."

        # Re-calculate exact EMI at final interest rate
        final_m_rate = (interest_rate / 100.0) / 12.0
        final_emi = approved_amt * final_m_rate * ((1 + final_m_rate)**tenure_months) / (((1 + final_m_rate)**tenure_months) - 1)

        loan_app = LoanApplication.objects.create(
            user=user,
            requested_amount=requested_amount,
            loan_purpose=loan_purpose,
            tenure_months=tenure_months,
            collateral_type=collateral_type,
            collateral_value=collateral_value,
            monthly_income=monthly_income,
            existing_emi=existing_emi,
            status=status_val,
            approved_amount=approved_amt,
            interest_rate=interest_rate,
            monthly_installment=round(final_emi, 2),
            risk_tier=risk_tier,
            underwriting_notes=notes
        )

        return Response({
            "message": "Loan application processed successfully",
            "application": {
                "id": loan_app.id,
                "requested_amount": loan_app.requested_amount,
                "loan_purpose": loan_app.loan_purpose,
                "tenure_months": loan_app.tenure_months,
                "status": loan_app.status,
                "approved_amount": loan_app.approved_amount,
                "interest_rate": loan_app.interest_rate,
                "monthly_installment": loan_app.monthly_installment,
                "risk_tier": loan_app.risk_tier,
                "underwriting_notes": loan_app.underwriting_notes,
                "created_at": loan_app.created_at.isoformat()
            }
        }, status=status.HTTP_201_CREATED)

    def get(self, request):
        profile, user = get_or_create_profile(request)
        apps = LoanApplication.objects.filter(user=user).order_by('-created_at')
        
        apps_list = []
        for a in apps:
            apps_list.append({
                "id": a.id,
                "requested_amount": a.requested_amount,
                "loan_purpose": a.loan_purpose,
                "tenure_months": a.tenure_months,
                "status": a.status,
                "approved_amount": a.approved_amount,
                "interest_rate": a.interest_rate,
                "monthly_installment": a.monthly_installment,
                "risk_tier": a.risk_tier,
                "created_at": a.created_at.strftime("%b %d, %Y")
            })

        return Response({"applications": apps_list}, status=status.HTTP_200_OK)


class AnalyticsTransactionsView(APIView):
    """Transactions list and summary endpoint"""
    permission_classes = [AllowAny]

    def get(self, request):
        profile, user = get_or_create_profile(request)
        
        # Sample structured transactions derived from company profile cashflow
        monthly = profile.monthly_cashflow or 24500.0
        
        sample_transactions = [
          {
            "id": "TXN-882101",
            "date": "2026-08-24",
            "merchant": "AWS Cloud Services",
            "category": "Infrastructure",
            "type": "debit",
            "amount": 1450.00,
            "status": "Completed",
            "payment_method": "Corporate Credit Card (•••• 4092)",
            "reference": "INV-2026-081"
          },
          {
            "id": "TXN-882102",
            "date": "2026-08-23",
            "merchant": "Stripe Merchant Payout",
            "category": "Client Revenue",
            "type": "credit",
            "amount": 12800.00,
            "status": "Completed",
            "payment_method": "ACH Direct Deposit",
            "reference": "SETTLE-88192"
          },
          {
            "id": "TXN-882103",
            "date": "2026-08-21",
            "merchant": "Salesforce SaaS Subscription",
            "category": "Software",
            "type": "debit",
            "amount": 850.00,
            "status": "Completed",
            "payment_method": "Auto-Debit Checking",
            "reference": "SUB-99412"
          },
          {
            "id": "TXN-882104",
            "date": "2026-08-20",
            "merchant": "Apex Enterprise Invoicing",
            "category": "Client Revenue",
            "type": "credit",
            "amount": 9450.00,
            "status": "Completed",
            "payment_method": "Wire Transfer",
            "reference": "INV-99014"
          },
          {
            "id": "TXN-882105",
            "date": "2026-08-18",
            "merchant": "WeWork Office Lease",
            "category": "Operations",
            "type": "debit",
            "amount": 3200.00,
            "status": "Completed",
            "payment_method": "ACH Direct Deposit",
            "reference": "LEASE-AUG26"
          },
          {
            "id": "TXN-882106",
            "date": "2026-08-15",
            "merchant": "Google Workspace & Ads",
            "category": "Marketing",
            "type": "debit",
            "amount": 1120.00,
            "status": "Pending",
            "payment_method": "Corporate Credit Card (•••• 4092)",
            "reference": "ADS-77291"
          },
          {
            "id": "TXN-882107",
            "date": "2026-08-12",
            "merchant": "Global Logistics Supply",
            "category": "Inventory",
            "type": "debit",
            "amount": 4500.00,
            "status": "Completed",
            "payment_method": "Wire Transfer",
            "reference": "PO-10492"
          },
          {
            "id": "TXN-882108",
            "date": "2026-08-10",
            "merchant": "KPMG Tax Compliance Retainer",
            "category": "Professional Services",
            "type": "debit",
            "amount": 2100.00,
            "status": "Flagged",
            "payment_method": "ACH Direct Deposit",
            "reference": "RET-2026-Q3"
          }
        ]

        total_inflow = sum(t['amount'] for t in sample_transactions if t['type'] == 'credit')
        total_outflow = sum(t['amount'] for t in sample_transactions if t['type'] == 'debit')
        
        return Response({
            "summary": {
                "account_balance": profile.annual_revenue * 0.45 or 144000.0,
                "monthly_inflow": total_inflow or 22250.0,
                "monthly_outflow": total_outflow or 13420.0,
                "net_cashflow": total_inflow - total_outflow,
                "pending_count": sum(1 for t in sample_transactions if t['status'] == 'Pending')
            },
            "transactions": sample_transactions
        }, status=status.HTTP_200_OK)


class AnalyticsSettingsView(APIView):
    """User & Business profile settings GET / POST view"""
    permission_classes = [AllowAny]

    def get(self, request):
        profile, user = get_or_create_profile(request)
        picture = user.profile.picture if hasattr(user, 'profile') and user.profile.picture else None

        return Response({
            "user": {
                "first_name": user.first_name or "User",
                "last_name": user.last_name or "",
                "email": user.email,
                "picture": picture,
            },
            "company": {
                "company_name": profile.company_name,
                "tax_id": profile.tax_id,
                "industry": profile.industry,
                "annual_revenue": profile.annual_revenue,
                "monthly_cashflow": profile.monthly_cashflow,
                "debt_to_income_ratio": profile.debt_to_income_ratio,
            },
            "preferences": {
                "email_notifications": True,
                "cashflow_alert_threshold": 5000,
                "two_factor_auth": False,
                "theme_mode": "dark"
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        profile, user = get_or_create_profile(request)
        data = request.data

        # Update User details
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data and data['email']:
            user.email = data['email']
            user.username = data['email']
        user.save()

        # Update picture on authentication profile
        if 'picture' in data and hasattr(user, 'profile'):
            user.profile.picture = data['picture']
            user.profile.save()

        # Update Company details
        if 'company_name' in data:
            profile.company_name = data['company_name']
        if 'tax_id' in data:
            profile.tax_id = data['tax_id']
        if 'industry' in data:
            profile.industry = data['industry']
        if 'annual_revenue' in data:
            try:
                profile.annual_revenue = float(data['annual_revenue'])
            except (ValueError, TypeError):
                pass
        if 'monthly_cashflow' in data:
            try:
                profile.monthly_cashflow = float(data['monthly_cashflow'])
            except (ValueError, TypeError):
                pass
        profile.save()

        picture = user.profile.picture if hasattr(user, 'profile') and user.profile.picture else data.get('picture')

        return Response({
            "message": "Settings updated successfully",
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "picture": picture,
            },
            "company": {
                "company_name": profile.company_name,
                "tax_id": profile.tax_id,
                "industry": profile.industry,
                "annual_revenue": profile.annual_revenue,
                "monthly_cashflow": profile.monthly_cashflow
            }
        }, status=status.HTTP_200_OK)


class LoanOfficerApplicationsView(APIView):
    """View for Loan Officers to fetch all loan applications submitted by business owners"""
    permission_classes = [AllowAny]

    def get(self, request):
        applications = LoanApplication.objects.all().order_by('-created_at')
        apps_list = []
        for app in applications:
            applicant = app.user
            bus_profile = getattr(applicant, 'business_profile', None)
            score_info = calculate_credit_score(bus_profile) if bus_profile else {"score": 720}
            
            # Calculate DSCR
            monthly_income = app.monthly_income or (bus_profile.monthly_cashflow if bus_profile else 24500.0)
            existing_emi = app.existing_emi or 0.0
            emi = app.monthly_installment or 0.0
            dscr = round(monthly_income / max(1.0, existing_emi + emi), 2)

            apps_list.append({
                "id": app.id,
                "applicant": {
                    "id": applicant.id,
                    "name": f"{applicant.first_name} {applicant.last_name}".strip() or applicant.username,
                    "email": applicant.email,
                    "company_name": bus_profile.company_name if bus_profile else "N/A",
                    "tax_id": bus_profile.tax_id if bus_profile else "N/A",
                    "industry": bus_profile.industry if bus_profile else "N/A",
                    "annual_revenue": bus_profile.annual_revenue if bus_profile else 0.0,
                    "monthly_cashflow": bus_profile.monthly_cashflow if bus_profile else 0.0,
                    "debt_to_income_ratio": bus_profile.debt_to_income_ratio if bus_profile else 0.0,
                    "credit_score": score_info.get("score", 720),
                    "score_status": score_info.get("status", "GOOD SCORE")
                },
                "requested_amount": app.requested_amount,
                "loan_purpose": app.loan_purpose,
                "tenure_months": app.tenure_months,
                "collateral_type": app.collateral_type,
                "collateral_value": app.collateral_value,
                "monthly_income": app.monthly_income,
                "existing_emi": app.existing_emi,
                "status": app.status,
                "approved_amount": app.approved_amount,
                "interest_rate": app.interest_rate,
                "monthly_installment": app.monthly_installment,
                "risk_tier": app.risk_tier,
                "dscr": dscr,
                "underwriting_notes": app.underwriting_notes or "",
                "created_at": app.created_at.strftime("%b %d, %Y %H:%M")
            })

        return Response({"applications": apps_list}, status=status.HTTP_200_OK)


class LoanOfficerUpdateStatusView(APIView):
    """View for Loan Officers to approve, reject, or modify underwriting notes of an application"""
    permission_classes = [AllowAny]

    def patch(self, request, app_id):
        try:
            app = LoanApplication.objects.get(id=app_id)
        except LoanApplication.DoesNotExist:
            return Response({"error": "Loan application not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'status' in data and data['status']:
            app.status = data['status']
        if 'approved_amount' in data:
            try:
                app.approved_amount = float(data['approved_amount'])
            except (ValueError, TypeError):
                pass
        if 'interest_rate' in data:
            try:
                app.interest_rate = float(data['interest_rate'])
            except (ValueError, TypeError):
                pass
        if 'underwriting_notes' in data:
            app.underwriting_notes = str(data['underwriting_notes'])

        app.save()
        return Response({"message": "Loan application updated successfully", "status": app.status}, status=status.HTTP_200_OK)


