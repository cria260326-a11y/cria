import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';

/* ═══════════════════════════════════════════════════════════════════════════
   VETRINA — pagine pubbliche
   ═══════════════════════════════════════════════════════════════════════════ */
import HomePage from '@/pages/Vetrina/HomePage';
import HowItWorksPage from '@/pages/Vetrina/HowItWorksPage';
import PerLocatoriPage from '@/pages/Vetrina/PerLocatoriPage';
import PerInquiliniPage from '@/pages/Vetrina/PerInquiliniPage';
import VerificaInquilinoPage from '@/pages/Vetrina/VerificaInquilinoPage';
import SupportoPage from '@/pages/Vetrina/SupportoPage';
import IniziaPagina from '@/pages/Vetrina/IniziaPagina';

/* Legali */
import PrivacyPage from '@/pages/Vetrina/Legali/PrivacyPage';
import TerminiPage from '@/pages/Vetrina/Legali/TerminiPage';
import CookiePage from '@/pages/Vetrina/Legali/CookiePage';

/* ═══════════════════════════════════════════════════════════════════════════
   ACCESSO — login e registrazione
   ═══════════════════════════════════════════════════════════════════════════ */
import LoginPage from '@/pages/Accesso/LoginPage';
import RegisterPage from '@/pages/Accesso/RegisterPage';

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — flusso post-registrazione
   ═══════════════════════════════════════════════════════════════════════════ */
import SceltaProdotto from '@/pages/Onboarding/SceltaProdotto';
import OnboardingUtente from '@/pages/Onboarding/OnboardingUtente';

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════════════════════════════════════ */
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import ClientiPage from '@/pages/Admin/ClientiPage';
import SchedaClientePage from '@/pages/Admin/SchedaClientePage';
import ContrattiPage from '@/pages/Admin/ContrattiPage';
import SchedaImmobilePage from '@/pages/Admin/SchedaImmobilePage';
import SegnalazioniPage from '@/pages/Admin/SegnalazioniPage';
import PagamentiPage from '@/pages/Admin/PagamentiPage';
import BonificiPage from '@/pages/Admin/BonificiPage';
import CollaboratoriPage from '@/pages/Admin/CollaboratoriPage';
import SchedaCollaboratorePage from '@/pages/Admin/SchedaCollaboratorePage';
import ProdottiAdminPage from '@/pages/Admin/ProdottiPage';
import VenditePage from '@/pages/Admin/VenditePage';
import ProvvigioniAdminPage from '@/pages/Admin/ProvvigioniPage';
import AssistenzaAdminPage from '@/pages/Admin/AssistenzaPage';
import OnboardingAdminPage from '@/pages/Admin/OnboardingPage';
import FaqAdminPage from '@/pages/Admin/FaqAdminPage';
import ContestazionePageAdmin from '@/pages/Admin/ContestazionePage';
import ProfiloAdminPage from '@/pages/Admin/ProfiloAdminPage';
import ImpostazioniPage from '@/pages/Admin/ImpostazioniPage';
import EmailPage from '@/pages/Admin/EmailPage';
import ContabilitaPage from '@/pages/Admin/ContabilitaPage';
import AnalyticsPage from '@/pages/Admin/AnalyticsPage';

/* ═══════════════════════════════════════════════════════════════════════════
   locatore
   ═══════════════════════════════════════════════════════════════════════════ */
import LocatoreLayout from '@/components/layout/LocatoreLayout';
import LandlordDashboard from '@/pages/Locatore/LandlordDashboard';
import ImmobiliPage from '@/pages/Locatore/ImmobiliPage';
import SchedaImmobileLocatorePage from '@/pages/Locatore/SchedaImmobileLocatorePage';
import SegnalazioniLocatorePage from '@/pages/Locatore/SegnalazioniLocatorePage';
import ContestazionePagelocatore from '@/pages/Locatore/ContestazionePage';
import PagamentiLocatorePage from '@/pages/Locatore/PagamentiLocatorePage';
import DocumentiLocatorePage from '@/pages/Locatore/DocumentiLocatorePage';
import AssistenzaLocatorePage from '@/pages/Locatore/AssistenzaLocatorePage';
import ProfiloLocatorePage from '@/pages/Locatore/ProfiloLocatorePage';

/* ═══════════════════════════════════════════════════════════════════════════
   INQUILINO
   ═══════════════════════════════════════════════════════════════════════════ */
import InquilinoLayout from '@/components/layout/InquilinoLayout';
import TenantDashboard from '@/pages/Inquilino/TenantDashboard';
import ContrattoInquilinoPage from '@/pages/Inquilino/ContrattoInquilinoPage';
import PagamentiInquilinoPage from '@/pages/Inquilino/PagamentiInquilinoPage';
import SegnalazioniInquilinoPage from '@/pages/Inquilino/SegnalazioniInquilinoPage';
import ContestazionePageInquilino from '@/pages/Inquilino/ContestazionePageInquilino';
import AssistenzaInquilinoPage from '@/pages/Inquilino/AssistenzaInquilinoPage';
import ProfiloInquilinoPage from '@/pages/Inquilino/ProfiloInquilinoPage';

/* ═══════════════════════════════════════════════════════════════════════════
   AVVOCATO
   ═══════════════════════════════════════════════════════════════════════════ */
import AvvocatoLayout from '@/components/layout/AvvocatoLayout';
import AvvocatoDashboard from '@/pages/Avvocato/AvvocatoDashboard';
import CodaLavoroPage from '@/pages/Avvocato/CodaLavoroPage';
import ClientiAssegnatiPage from '@/pages/Avvocato/ClientiAssegnatiPage';
import SchedaClienteAvvocatoPage from '@/pages/Avvocato/SchedaClienteAvvocatoPage';
import ScadenzeAvvocatoPage from '@/pages/Avvocato/ScadenzeAvvocatoPage';
import CompensiAvvocatoPage from '@/pages/Avvocato/CompensiAvvocatoPage';
import ProfiloAvvocatoPage from '@/pages/Avvocato/ProfiloAvvocatoPage';

/* ═══════════════════════════════════════════════════════════════════════════
   COMMERCIALE
   ═══════════════════════════════════════════════════════════════════════════ */
import CommercialeLayout from '@/components/layout/CommercialeLayout';
import CommercialeDashboard from '@/pages/Commerciale/CommercialeDashboard';
import MieiClientiPage from '@/pages/Commerciale/MieiClientiPage';
import SchedaClienteCommercialePage from '@/pages/Commerciale/SchedaClienteCommercialePage';
import ContrattiCommercialePage from '@/pages/Commerciale/ContrattiCommercialePage';
import ProvvigioniCommercialePage from '@/pages/Commerciale/ProvvigioniCommercialePage';
import AssistenzaCommercialePage from '@/pages/Commerciale/AssistenzaCommercialePage';
import ProfiloCommercialePage from '@/pages/Commerciale/ProfiloCommercialePage';


/* ═══════════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════════ */
function App() {
   return (
      <BrowserRouter>
         <ScrollToTop />
         <AuthProvider>
            <Toaster position="top-right" richColors closeButton />

            <Routes>

               {/* ─── VETRINA (pubblico) ──────────────────────────────────────── */}
               <Route path="/" element={<HomePage />} />
               <Route path="/come-funziona" element={<HowItWorksPage />} />
               <Route path="/per-locatori" element={<PerLocatoriPage />} />
               <Route path="/per-inquilini" element={<PerInquiliniPage />} />
               <Route path="/verifica" element={<VerificaInquilinoPage />} />
               <Route path="/supporto" element={<SupportoPage />} />
               <Route path="/inizia" element={<IniziaPagina />} />
               <Route path="/privacy" element={<PrivacyPage />} />
               <Route path="/termini" element={<TerminiPage />} />
               <Route path="/cookie" element={<CookiePage />} />

               {/* ─── ACCESSO ─────────────────────────────────────────────────── */}
               <Route path="/login" element={<LoginPage />} />
               <Route path="/signup" element={<RegisterPage />} />

               {/* ─── ONBOARDING ──────────────────────────────────────────────── */}
               <Route path="/scegli-prodotto" element={<SceltaProdotto />} />
               <Route path="/onboarding" element={<OnboardingUtente />} />

               {/* ─── ADMIN ───────────────────────────────────────────────────── */}
               <Route path="/dashboard/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
               <Route path="/dashboard/admin/clienti" element={<AdminLayout><ClientiPage /></AdminLayout>} />
               <Route path="/dashboard/admin/clienti/:id" element={<AdminLayout><SchedaClientePage /></AdminLayout>} />
               <Route path="/dashboard/admin/contratti" element={<AdminLayout><ContrattiPage /></AdminLayout>} />
               <Route path="/dashboard/admin/immobili/:id" element={<AdminLayout><SchedaImmobilePage /></AdminLayout>} />
               <Route path="/dashboard/admin/segnalazioni" element={<AdminLayout><SegnalazioniPage /></AdminLayout>} />
               <Route path="/dashboard/admin/contestazioni" element={<AdminLayout><ContestazionePageAdmin /></AdminLayout>} />
               <Route path="/dashboard/admin/contestazioni/:id" element={<AdminLayout><ContestazionePageAdmin /></AdminLayout>} />
               <Route path="/dashboard/admin/pagamenti" element={<AdminLayout><PagamentiPage /></AdminLayout>} />
               <Route path="/dashboard/admin/bonifici" element={<AdminLayout><BonificiPage /></AdminLayout>} />
               <Route path="/dashboard/admin/collaboratori" element={<AdminLayout><CollaboratoriPage /></AdminLayout>} />
               <Route path="/dashboard/admin/collaboratori/:id" element={<AdminLayout><SchedaCollaboratorePage /></AdminLayout>} />
               <Route path="/dashboard/admin/prodotti" element={<AdminLayout><ProdottiAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/vendite" element={<AdminLayout><VenditePage /></AdminLayout>} />
               <Route path="/dashboard/admin/provvigioni" element={<AdminLayout><ProvvigioniAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/assistenza" element={<AdminLayout><AssistenzaAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/onboarding" element={<AdminLayout><OnboardingAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/faq" element={<AdminLayout><FaqAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/profilo" element={<AdminLayout><ProfiloAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/impostazioni" element={<AdminLayout><ImpostazioniPage /></AdminLayout>} />
               <Route path="/dashboard/admin/email" element={<AdminLayout><EmailPage /></AdminLayout>} />
               <Route path="/dashboard/admin/contabilita" element={<AdminLayout><ContabilitaPage /></AdminLayout>} />
               <Route path="/dashboard/admin/analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />

               {/* ─── locatore ───────────────────────────────────────────────── */}
               <Route path="/dashboard/locatore" element={<LocatoreLayout><LandlordDashboard /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/immobili" element={<LocatoreLayout><ImmobiliPage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/immobili/:id" element={<LocatoreLayout><SchedaImmobileLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/segnalazioni" element={<LocatoreLayout><SegnalazioniLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/contestazioni" element={<LocatoreLayout><ContestazionePagelocatore /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/contestazioni/:id" element={<LocatoreLayout><ContestazionePagelocatore /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/pagamenti" element={<LocatoreLayout><PagamentiLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/documenti" element={<LocatoreLayout><DocumentiLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/assistenza" element={<LocatoreLayout><AssistenzaLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/profilo" element={<LocatoreLayout><ProfiloLocatorePage /></LocatoreLayout>} />

               {/* ─── INQUILINO ───────────────────────────────────────────────── */}
               <Route path="/dashboard/inquilino" element={<InquilinoLayout><TenantDashboard /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contratto" element={<InquilinoLayout><ContrattoInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/pagamenti" element={<InquilinoLayout><PagamentiInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/segnalazioni" element={<InquilinoLayout><SegnalazioniInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contestazioni" element={<InquilinoLayout><ContestazionePageInquilino /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contestazioni/:id" element={<InquilinoLayout><ContestazionePageInquilino /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/assistenza" element={<InquilinoLayout><AssistenzaInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/profilo" element={<InquilinoLayout><ProfiloInquilinoPage /></InquilinoLayout>} />

               {/* ─── AVVOCATO ────────────────────────────────────────────────── */}
               <Route path="/dashboard/avvocato" element={<AvvocatoLayout><AvvocatoDashboard /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/coda" element={<AvvocatoLayout><CodaLavoroPage /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/clienti" element={<AvvocatoLayout><ClientiAssegnatiPage /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/clienti/:id" element={<AvvocatoLayout><SchedaClienteAvvocatoPage /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/scadenze" element={<AvvocatoLayout><ScadenzeAvvocatoPage /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/compensi" element={<AvvocatoLayout><CompensiAvvocatoPage /></AvvocatoLayout>} />
               <Route path="/dashboard/avvocato/profilo" element={<AvvocatoLayout><ProfiloAvvocatoPage /></AvvocatoLayout>} />

               {/* ─── COMMERCIALE ─────────────────────────────────────────────── */}
               <Route path="/dashboard/commerciale" element={<CommercialeLayout><CommercialeDashboard /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/clienti" element={<CommercialeLayout><MieiClientiPage /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/clienti/:id" element={<CommercialeLayout><SchedaClienteCommercialePage /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/contratti" element={<CommercialeLayout><ContrattiCommercialePage /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/provvigioni" element={<CommercialeLayout><ProvvigioniCommercialePage /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/assistenza" element={<CommercialeLayout><AssistenzaCommercialePage /></CommercialeLayout>} />
               <Route path="/dashboard/commerciale/profilo" element={<CommercialeLayout><ProfiloCommercialePage /></CommercialeLayout>} />

            </Routes>
         </AuthProvider>
      </BrowserRouter>
   );
}

export default App;