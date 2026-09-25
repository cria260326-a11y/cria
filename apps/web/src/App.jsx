import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { TestiProvider } from '@/lib/testi';
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
import RecuperaPasswordPage from '@/pages/Accesso/RecuperaPasswordPage';
import AttivaAccountPage from '@/pages/Accesso/AttivaAccountPage';
import VerificaEmailPage from '@/pages/Accesso/VerificaEmailPage';
import ReimpostaPasswordPage from '@/pages/Accesso/ReimpostaPasswordPage';
import AuthCallbackPage from '@/pages/Accesso/AuthCallbackPage';
import InAttesaVerificaPage from '@/pages/Accesso/InAttesaVerificaPage';
import SmistamentoPage from '@/pages/Accesso/SmistamentoPage';

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILO — pagine di tutti, dentro l'area da cui si arriva
   ═══════════════════════════════════════════════════════════════════════════ */
import LayoutDelContesto from '@/components/layout/LayoutDelContesto';
import ProfiloPage from '@/pages/Profilo/ProfiloPage';
import DocumentoIdentitaPage from '@/pages/Profilo/DocumentoIdentitaPage';
import FatturazionePage from '@/pages/Profilo/FatturazionePage';
import ConsensiPage from '@/pages/Profilo/ConsensiPage';
import IMieiDatiPage from '@/pages/Profilo/IMieiDatiPage';

/* ═══════════════════════════════════════════════════════════════════════════
   ONBOARDING — flusso post-registrazione
   ═══════════════════════════════════════════════════════════════════════════ */
import SceltaProdotto from '@/pages/Onboarding/SceltaProdotto';
import OnboardingUtente from '@/pages/Onboarding/OnboardingUtente';
import CheckoutPage from '@/pages/Onboarding/CheckoutPage';
import FirmaPage from '@/pages/Onboarding/FirmaPage';
import RichiedeAccesso from '@/components/accesso/RichiedeAccesso';

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE (P3 — CRIA Verifica)
   ═══════════════════════════════════════════════════════════════════════════ */
import ClienteLayout from '@/components/layout/ClienteLayout';
import ClienteDashboard from '@/pages/Cliente/ClienteDashboard';
import NuovaVerificaPage from '@/pages/Cliente/NuovaVerificaPage';
import EsitoVerificaPage from '@/pages/Cliente/EsitoVerificaPage';

/* ═══════════════════════════════════════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════════════════════════════════════ */
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import LavoroPage from '@/pages/Admin/LavoroPage';
import ClientiPage from '@/pages/Admin/ClientiPage';
import SchedaClientePage from '@/pages/Admin/SchedaClientePage';
import CreaUtentePage from '@/pages/Admin/CreaUtentePage';
import ContrattiPage from '@/pages/Admin/ContrattiPage';
import SchedaImmobilePage from '@/pages/Admin/SchedaImmobilePage';
import SegnalazioniPage from '@/pages/Admin/SegnalazioniPage';
import PagamentiPage from '@/pages/Admin/PagamentiPage';
import BonificiPage from '@/pages/Admin/BonificiPage';
import CollaboratoriPage from '@/pages/Admin/CollaboratoriPage';
import SchedaCollaboratorePage from '@/pages/Admin/SchedaCollaboratorePage';
import ProdottiAdminPage from '@/pages/Admin/ProdottiPage';
import SchedaProdottoPage from '@/pages/Admin/SchedaProdottoPage';
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
import AnagrafichePage from '@/pages/Admin/AnagrafichePage';
import RiconciliazionePage from '@/pages/Admin/RiconciliazionePage';
import MorositaAdminPage from '@/pages/Admin/MorositaAdminPage';
import SchedaMorositaAdminPage from '@/pages/Admin/SchedaMorositaAdminPage';
import IndennizziPage from '@/pages/Admin/IndennizziPage';
import RiassicurazionePage from '@/pages/Admin/RiassicurazionePage';
import ScadenzePage from '@/pages/Admin/ScadenzePage';
import NotifichePage from '@/pages/Admin/NotifichePage';
import TestiPage from '@/pages/Admin/TestiPage';

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
import PraticheLocatorePage from '@/pages/Locatore/PraticheLocatorePage';
import MorositaLocatorePage from '@/pages/Locatore/MorositaLocatorePage';
import AssistenzaLocatorePage from '@/pages/Locatore/AssistenzaLocatorePage';

/* ═══════════════════════════════════════════════════════════════════════════
   INQUILINO
   ═══════════════════════════════════════════════════════════════════════════ */
import InquilinoLayout from '@/components/layout/InquilinoLayout';
import TenantDashboard from '@/pages/Inquilino/TenantDashboard';
import ContrattoInquilinoPage from '@/pages/Inquilino/ContrattoInquilinoPage';
import PagamentiInquilinoPage from '@/pages/Inquilino/PagamentiInquilinoPage';
import SegnalazioniInquilinoPage from '@/pages/Inquilino/SegnalazioniInquilinoPage';
import ContestazionePageInquilino from '@/pages/Inquilino/ContestazionePageInquilino';
import SemaforoInquilinoPage from '@/pages/Inquilino/SemaforoInquilinoPage';
import MorositaInquilinoPage from '@/pages/Inquilino/MorositaInquilinoPage';
import CertificatoInquilinoPage from '@/pages/Inquilino/CertificatoInquilinoPage';
import VerificaCertificatoPage from '@/pages/Vetrina/VerificaCertificatoPage';
import CandidatoPage from '@/pages/Vetrina/CandidatoPage';
import ReferenzaPage from '@/pages/Vetrina/ReferenzaPage';
import AutocandidaturaPage from '@/pages/Onboarding/AutocandidaturaPage';

// Il QR del certificato porta a un indirizzo corto: /v/CODICE
const VaiAllaVerifica = () => {
    const { codice } = useParams();
    return <Navigate to={`/verifica-certificato?codice=${encodeURIComponent(codice || '')}`} replace />;
};
import AssistenzaInquilinoPage from '@/pages/Inquilino/AssistenzaInquilinoPage';

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
         <TestiProvider>
         <AuthProvider>
            <Toaster position="top-right" richColors closeButton />

            <Routes>

               {/* ─── VETRINA (pubblico) ──────────────────────────────────────── */}
               <Route path="/" element={<HomePage />} />
               <Route path="/come-funziona" element={<HowItWorksPage />} />
               <Route path="/per-proprietari" element={<PerLocatoriPage />} />
               <Route path="/verifica-certificato" element={<VerificaCertificatoPage />} />
               <Route path="/v/:codice" element={<VaiAllaVerifica />} />
               <Route path="/candidato/:token" element={<CandidatoPage />} />
               <Route path="/referenza/:token" element={<ReferenzaPage />} />
               <Route path="/per-locatori" element={<Navigate to="/per-proprietari" replace />} />
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
               <Route path="/recupera-password" element={<RecuperaPasswordPage />} />
               <Route path="/attiva-account" element={<AttivaAccountPage />} />
               <Route path="/verifica-email" element={<VerificaEmailPage />} />
               <Route path="/reimposta-password" element={<ReimpostaPasswordPage />} />
               <Route path="/auth/callback" element={<AuthCallbackPage />} />
               <Route path="/in-attesa" element={<InAttesaVerificaPage />} />
               <Route path="/dashboard" element={<SmistamentoPage />} />

               {/* ─── PROFILO ─────────────────────────────────────────────────── */}
               <Route path="/profilo" element={<LayoutDelContesto titolo="Il mio profilo"><ProfiloPage /></LayoutDelContesto>} />
               <Route path="/profilo/identita" element={<LayoutDelContesto titolo="Documento d'identità"><DocumentoIdentitaPage /></LayoutDelContesto>} />
               <Route path="/profilo/fatturazione" element={<LayoutDelContesto titolo="Dati di fatturazione"><FatturazionePage /></LayoutDelContesto>} />
               <Route path="/profilo/consensi" element={<LayoutDelContesto titolo="Consensi"><ConsensiPage /></LayoutDelContesto>} />
               <Route path="/profilo/i-miei-dati" element={<LayoutDelContesto titolo="I miei dati"><IMieiDatiPage /></LayoutDelContesto>} />

               {/* ─── ONBOARDING ──────────────────────────────────────────────── */}
               <Route path="/scegli-prodotto" element={<RichiedeAccesso><SceltaProdotto /></RichiedeAccesso>} />
               <Route path="/onboarding" element={<RichiedeAccesso><OnboardingUtente /></RichiedeAccesso>} />
               <Route path="/checkout/:praticaId" element={<RichiedeAccesso><CheckoutPage /></RichiedeAccesso>} />
               <Route path="/firma/:praticaId" element={<RichiedeAccesso><FirmaPage /></RichiedeAccesso>} />
               <Route path="/certificato/autocandidatura" element={<RichiedeAccesso><AutocandidaturaPage /></RichiedeAccesso>} />
               <Route path="/certificato/autocandidatura/prove" element={<RichiedeAccesso><AutocandidaturaPage /></RichiedeAccesso>} />

               {/* ─── ADMIN ───────────────────────────────────────────────────── */}
               <Route path="/dashboard/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
               <Route path="/dashboard/admin/lavoro" element={<AdminLayout><LavoroPage /></AdminLayout>} />
               <Route path="/dashboard/admin/clienti" element={<AdminLayout><ClientiPage /></AdminLayout>} />
               <Route path="/dashboard/admin/clienti/nuovo" element={<AdminLayout><CreaUtentePage /></AdminLayout>} />
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
               <Route path="/dashboard/admin/prodotti/nuovo" element={<AdminLayout><SchedaProdottoPage /></AdminLayout>} />
               <Route path="/dashboard/admin/prodotti/:codice" element={<AdminLayout><SchedaProdottoPage /></AdminLayout>} />
               <Route path="/dashboard/admin/vendite" element={<AdminLayout><VenditePage /></AdminLayout>} />
               <Route path="/dashboard/admin/provvigioni" element={<AdminLayout><ProvvigioniAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/assistenza" element={<AdminLayout><AssistenzaAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/onboarding" element={<AdminLayout><OnboardingAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/faq" element={<AdminLayout><FaqAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/profilo" element={<AdminLayout><ProfiloAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/impostazioni" element={<AdminLayout><ImpostazioniPage /></AdminLayout>} />
               <Route path="/dashboard/admin/email" element={<AdminLayout><EmailPage /></AdminLayout>} />
               <Route path="/dashboard/admin/contabilita" element={<AdminLayout><ContabilitaPage /></AdminLayout>} />
               <Route path="/dashboard/admin/anagrafiche" element={<AdminLayout><AnagrafichePage /></AdminLayout>} />
               <Route path="/dashboard/admin/riconciliazione" element={<AdminLayout><RiconciliazionePage /></AdminLayout>} />
               <Route path="/dashboard/admin/morosita" element={<AdminLayout><MorositaAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/morosita/:id" element={<AdminLayout><SchedaMorositaAdminPage /></AdminLayout>} />
               <Route path="/dashboard/admin/indennizzi" element={<AdminLayout><IndennizziPage /></AdminLayout>} />
               <Route path="/dashboard/admin/riassicurazione" element={<AdminLayout><RiassicurazionePage /></AdminLayout>} />
               <Route path="/dashboard/admin/scadenze" element={<AdminLayout><ScadenzePage /></AdminLayout>} />
               <Route path="/dashboard/admin/notifiche" element={<AdminLayout><NotifichePage /></AdminLayout>} />
               <Route path="/dashboard/admin/testi" element={<AdminLayout><TestiPage /></AdminLayout>} />

               {/* ─── locatore ───────────────────────────────────────────────── */}
               <Route path="/dashboard/locatore" element={<LocatoreLayout><LandlordDashboard /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/immobili" element={<LocatoreLayout><ImmobiliPage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/immobili/:id" element={<LocatoreLayout><SchedaImmobileLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/segnalazioni" element={<LocatoreLayout><SegnalazioniLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/contestazioni" element={<LocatoreLayout><ContestazionePagelocatore /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/contestazioni/:id" element={<LocatoreLayout><ContestazionePagelocatore /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/pagamenti" element={<LocatoreLayout><PagamentiLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/documenti" element={<LocatoreLayout><DocumentiLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/pratiche" element={<LocatoreLayout><PraticheLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/pratiche/:id" element={<LocatoreLayout><PraticheLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/morosita/:id" element={<LocatoreLayout titolo="Pratica di morosità"><MorositaLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/assistenza" element={<LocatoreLayout><AssistenzaLocatorePage /></LocatoreLayout>} />
               <Route path="/dashboard/locatore/profilo" element={<Navigate to="/profilo" replace />} />

               {/* ─── INQUILINO ───────────────────────────────────────────────── */}
               <Route path="/dashboard/inquilino" element={<InquilinoLayout><TenantDashboard /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contratto" element={<InquilinoLayout><ContrattoInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/pagamenti" element={<InquilinoLayout><PagamentiInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/segnalazioni" element={<InquilinoLayout><SegnalazioniInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contestazioni" element={<InquilinoLayout><ContestazionePageInquilino /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/contestazioni/:id" element={<InquilinoLayout><ContestazionePageInquilino /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/assistenza" element={<InquilinoLayout><AssistenzaInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/semaforo" element={<InquilinoLayout><SemaforoInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/morosita" element={<InquilinoLayout titolo="La mia pratica di morosità"><MorositaInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/certificato" element={<InquilinoLayout><CertificatoInquilinoPage /></InquilinoLayout>} />
               <Route path="/dashboard/inquilino/profilo" element={<Navigate to="/profilo" replace />} />

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

               {/* ─── CLIENTE (P3) ────────────────────────────────────────────── */}
               <Route path="/dashboard/cliente" element={<ClienteLayout><ClienteDashboard /></ClienteLayout>} />
               <Route path="/dashboard/cliente/richieste/:id" element={<ClienteLayout><EsitoVerificaPage /></ClienteLayout>} />
               <Route path="/verifica/nuova" element={<RichiedeAccesso><NuovaVerificaPage /></RichiedeAccesso>} />

            </Routes>
         </AuthProvider>
         </TestiProvider>
      </BrowserRouter>
   );
}

export default App;