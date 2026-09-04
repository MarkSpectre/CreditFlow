from django.urls import path
from .views import (
    AnalyticsOverviewView,
    AnalyticsScoreView,
    AnalyticsForecastView,
    AnalyticsVerifyView,
    OnboardingSubmitView,
    LoanApplicationView,
    AnalyticsTransactionsView,
    AnalyticsSettingsView,
    LoanOfficerApplicationsView,
    LoanOfficerUpdateStatusView
)

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('score/', AnalyticsScoreView.as_view(), name='analytics_score'),
    path('forecast/', AnalyticsForecastView.as_view(), name='analytics_forecast'),
    path('verify/', AnalyticsVerifyView.as_view(), name='analytics_verify'),
    path('onboarding/submit/', OnboardingSubmitView.as_view(), name='analytics_onboarding_submit'),
    path('loan/apply/', LoanApplicationView.as_view(), name='loan_apply'),
    path('loan/applications/', LoanApplicationView.as_view(), name='loan_applications'),
    path('loan/officer/applications/', LoanOfficerApplicationsView.as_view(), name='loan_officer_applications'),
    path('loan/officer/applications/<int:app_id>/status/', LoanOfficerUpdateStatusView.as_view(), name='loan_officer_update_status'),
    path('transactions/', AnalyticsTransactionsView.as_view(), name='analytics_transactions'),
    path('settings/', AnalyticsSettingsView.as_view(), name='analytics_settings'),
]


