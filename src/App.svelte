<script lang="ts">
  import { onMount } from "svelte";
  import BottomNavigation from "./components/BottomNavigation.svelte";
  import SaleEntryDialog from "./components/SaleEntryDialog.svelte";
  import Toast from "./components/Toast.svelte";
  import type { Sale, SellerProfile } from "./domain/models";
  import ProfilePage from "./routes/ProfilePage.svelte";
  import SalesPage from "./routes/SalesPage.svelte";
  import SummaryPage from "./routes/SummaryPage.svelte";
  import InsightsPage from "./routes/InsightsPage.svelte";
  import NotFoundPage from "./routes/NotFoundPage.svelte";
  import YearlyProgressPage from "./routes/YearlyProgressPage.svelte";
  import { DexieSaleRepository } from "./repositories/dexie-sale-repository";
  import { DexieSellerProfileRepository } from "./repositories/dexie-seller-profile-repository";
  import { createSale } from "./services/create-sale";
  import { updateSale as updateSaleDetails } from "./services/update-sale";

  const emptyProfile: SellerProfile = {
    name: "",
    commissionRate: 0,
    monthlyCommissionGoal: 0,
    workSchedule: {
      weekdays: [],
      startTime: "",
      endTime: "",
      breakHour: "",
    },
  };

  const saleRepository = new DexieSaleRepository();
  const profileRepository = new DexieSellerProfileRepository();

  let profile = $state<SellerProfile | null>(null);
  let sales = $state<Sale[]>([]);
  let loading = $state(true);
  let loadError = $state("");
  let saleDialogOpen = $state(false);
  let now = $state(new Date());

  const currency = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  type Page =
    | "summary"
    | "sales"
    | "profile"
    | "insights"
    | "not-found"
    | "yearly-progress";

  let activePage: Page = $state("summary");

  type toastType = "success" | "fail" | "info";
  interface ToastState {
    message: string;
    type: toastType;
    duration: number;
  }

  let toast = $state<ToastState | null>(null);

  function showToast(message: string, type: toastType, duration = 3000) {
    toast = { message, type, duration };
  }

  function pageFromHash(hash: string): Page {
    if (hash === "#sales") return "sales";
    if (hash === "#profile") return "profile";
    if (hash === "#insights") return "insights";
    if (hash === "#not-found") return "not-found";
    if (hash === "#yearly-progress") return "yearly-progress";
    return "summary";
  }

  function selectPage(page: Page) {
    activePage = page;
  }

  async function addSale(amount: number, retailCommissionRate?: number) {
    try {
      const sale = createSale(amount, undefined, retailCommissionRate);
      await saleRepository.add(sale);
      sales = [sale, ...sales];
      showToast("Venta guardada con exito.", "success");
    } catch (error) {
      showToast("No se pudo guardar la venta.", "fail");
      throw error;
    }
  }

  async function updateSale(
    sale: Sale,
    amount: number,
    retailCommissionRate?: number,
  ) {
    try {
      const updatedSale = updateSaleDetails(sale, amount, retailCommissionRate);
      await saleRepository.update(updatedSale);
      sales = sales.map((storedSale) =>
        storedSale.id === updatedSale.id ? updatedSale : storedSale,
      );

      showToast("Venta editada con exito.", "success");
    } catch (error) {
      showToast("No se pudo editar la venta, intente mas tarde.", "fail");
      throw error;
    }
  }

  async function deleteSale(id: string) {
    await saleRepository.delete(id);
    sales = sales.filter((sale) => sale.id !== id);
  }

  async function saveProfile(
    updatedProfile: SellerProfile,
    applyRetailRateToExistingSales = false,
  ) {
    try {
      const hasRetailSales = sales.some(
        (sale) => sale.retailCommissionRate !== undefined,
      );
      if (updatedProfile.commissionRateRetail === undefined && hasRetailSales) {
        throw new Error("Retail commission rate is still in use");
      }

      await profileRepository.save(
        updatedProfile,
        applyRetailRateToExistingSales,
      );
      profile = updatedProfile;
      if (
        applyRetailRateToExistingSales &&
        updatedProfile.commissionRateRetail !== undefined
      ) {
        const retailRate = updatedProfile.commissionRateRetail;
        sales = sales.map((sale) =>
          sale.retailCommissionRate === undefined
            ? sale
            : { ...sale, retailCommissionRate: retailRate },
        );
      }

      showToast("Configuraciones guardadas.", "success");
    } catch (error) {
      showToast("No se pudo guardar los cambios.", "fail");
      throw error;
    }
  }

  async function completeOnboarding(updatedProfile: SellerProfile) {
    await saveProfile(updatedProfile);
    activePage = "summary";
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }

  onMount(() => {
    const syncPageFromHash = () => {
      activePage = pageFromHash(window.location.hash);
    };

    syncPageFromHash();
    window.addEventListener("hashchange", syncPageFromHash);
    const clock = window.setInterval(() => (now = new Date()), 60_000);

    Promise.all([saleRepository.list(), profileRepository.get()])
      .then(([storedSales, storedProfile]) => {
        sales = storedSales;
        if (storedProfile) profile = storedProfile;
      })
      .catch(() => {
        loadError = "No pudimos abrir tus datos locales.";
      })
      .finally(() => {
        loading = false;
      });

    return () => {
      window.removeEventListener("hashchange", syncPageFromHash);
      window.clearInterval(clock);
    };
  });
</script>

<svelte:head>
  <meta name="description" content="Local-first sales tracking" />
</svelte:head>

<main class="app-shell">
  {#if toast}
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => (toast = null)}
    ></Toast>
  {/if}

  {#if loading}
    <section class="status-page" aria-live="polite">
      <p>Cargando tus datos…</p>
    </section>
  {:else if loadError}
    <section class="status-page" role="alert">
      <h1>No pudimos iniciar la aplicación</h1>
      <p>{loadError}</p>
    </section>
  {:else if profile === null}
    <ProfilePage
      profile={emptyProfile}
      onSave={completeOnboarding}
      onboarding
    />
  {:else}
    {#if activePage === "summary"}
      <SummaryPage {profile} {sales} {currency} {now} />
    {:else if activePage === "sales"}
      <SalesPage
        {sales}
        {profile}
        {currency}
        {now}
        onUpdate={updateSale}
        onDelete={deleteSale}
      />
    {:else if activePage === "insights"}
      <InsightsPage {profile} {sales} {currency} {now} />
    {:else if activePage === "profile"}
      <ProfilePage
        {profile}
        onSave={saveProfile}
        hasRetailSales={sales.some(
          (sale) => sale.retailCommissionRate !== undefined,
        )}
      />
    {:else if activePage === "yearly-progress"}
      <YearlyProgressPage {sales} {profile} {now}></YearlyProgressPage>
    {/if}

    <BottomNavigation
      {activePage}
      onSelect={selectPage}
      onAddSale={() => (saleDialogOpen = true)}
    />
    <SaleEntryDialog
      open={saleDialogOpen}
      retailCommissionRate={profile.commissionRateRetail}
      onClose={() => (saleDialogOpen = false)}
      onSave={addSale}
    />
  {/if}
</main>
