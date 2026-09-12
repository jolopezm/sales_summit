<script lang="ts">
  import type { SellerProfile } from "../domain/models";
  import { isMoneyAmount } from "../domain/sale-calculations";
  import { isValidWorkSchedule } from "../domain/insight-calculations";

  interface Props {
    profile: SellerProfile;
    onSave: (profile: SellerProfile) => Promise<void>;
    onboarding?: boolean;
  }

  const days = [
    { value: 0, short: "D", name: "Domingo" },
    { value: 1, short: "L", name: "Lunes" },
    { value: 2, short: "M", name: "Martes" },
    { value: 3, short: "X", name: "Miércoles" },
    { value: 4, short: "J", name: "Jueves" },
    { value: 5, short: "V", name: "Viernes" },
    { value: 6, short: "S", name: "Sábado" },
  ];

  let { profile, onSave, onboarding = false }: Props = $props();
  let name = $state("");
  let monthlyCommissionGoal = $state(0);
  let commissionPercent = $state(0);
  let weekdays = $state<number[]>([]);
  let startTime = $state("");
  let endTime = $state("");
  let breakHour = $state("");
  let saving = $state(false);
  let message = $state("");
  let error = $state("");
  let initialized = false;

  $effect(() => {
    if (initialized) return;
    name = profile.name;
    monthlyCommissionGoal = profile.monthlyCommissionGoal;
    commissionPercent = profile.commissionRate * 100;
    weekdays = [...profile.workSchedule.weekdays];
    startTime = profile.workSchedule.startTime;
    endTime = profile.workSchedule.endTime;
    breakHour = profile.workSchedule.breakHour;
    initialized = true;
  });

  function toggleDay(day: number) {
    weekdays = weekdays.includes(day)
      ? weekdays.filter((current) => current !== day)
      : [...weekdays, day].sort();
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    message = "";
    const schedule = { weekdays, startTime, endTime, breakHour };
    if (!name.trim()) error = "Ingresa tu nombre.";
    else if (
      !isMoneyAmount(monthlyCommissionGoal) ||
      monthlyCommissionGoal <= 0
    ) {
      error = "La meta debe ser un monto entero mayor que cero.";
    } else if (!(commissionPercent > 0 && commissionPercent <= 100)) {
      error = "La comisión debe estar entre 0 y 100%.";
    } else if (!isValidWorkSchedule(schedule)) {
      error =
        "Elige al menos un día y un horario de salida posterior a la entrada.";
    }
    if (error) return;

    saving = true;
    try {
      await onSave({
        name: name.trim(),
        monthlyCommissionGoal,
        commissionRate: commissionPercent / 100,
        workSchedule: schedule,
      });
      if (!onboarding) message = "Perfil actualizado.";
    } catch {
      error = "No pudimos guardar los cambios.";
    } finally {
      saving = false;
    }
  }
</script>

<section class="page-content" aria-labelledby="profile-title">
  <header class="page-header">
    <p class="eyebrow">{onboarding ? "Primeros pasos" : "Configuración"}</p>
    <h1 id="profile-title">
      {onboarding ? "Configura tu perfil" : "Tu perfil"}
    </h1>
    <p>
      {onboarding
        ? "Ingresa tus datos para comenzar a registrar tus ventas."
        : "Define tu meta de comisiones y las horas que trabajas."}
    </p>
  </header>

  <form class="profile-form" onsubmit={submit}>
    <article class="form-card">
      <h2>Datos personales</h2>
      <div class="field">
        <label for="username">Nombre</label>
        <input
          id="username"
          name="username"
          type="text"
          bind:value={name}
          required
        />
      </div>
      <div class="field">
        <label for="monthly-goal">Meta mensual de comisiones</label>
        <input
          id="monthly-goal"
          name="monthlyGoal"
          type="number"
          min="1"
          step="1"
          bind:value={monthlyCommissionGoal}
          required
        />
      </div>
      <div class="field">
        <label for="commission-rate">Porcentaje de comisión</label>
        <div class="suffix-input">
          <input
            id="commission-rate"
            name="commissionRate"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            bind:value={commissionPercent}
            required
          />
          <span>%</span>
        </div>
      </div>
    </article>

    <article class="form-card schedule-card">
      <h2>Horario</h2>
      <fieldset>
        <legend>Días de trabajo</legend>
        <div class="weekday-picker">
          {#each days as day}
            <button
              type="button"
              class:active={weekdays.includes(day.value)}
              aria-pressed={weekdays.includes(day.value)}
              aria-label={day.name}
              onclick={() => toggleDay(day.value)}>{day.short}</button
            >
          {/each}
        </div>
      </fieldset>
      <div class="schedule-times">
        <div class="field">
          <label for="start-time">Entrada</label>
          <input
            id="start-time"
            name="startTime"
            type="time"
            bind:value={startTime}
            required
          />
        </div>
        <div class="field">
          <label for="end-time">Salida</label>
          <input
            id="end-time"
            name="endTime"
            type="time"
            bind:value={endTime}
            required
          />
        </div>
      </div>

      <div class="field">
        <label for="break-hour">Hora de almuerzo o break</label>
        <input
          id="break-hour"
          name="breakHour"
          type="time"
          bind:value={breakHour}
        />
      </div>
      <p class="form-help">
        Las proyecciones usan las horas programadas transcurridas en el mes.
      </p>
    </article>

    {#if error}<p class="form-error" role="alert">{error}</p>{/if}
    {#if message}<p class="form-success" role="status">{message}</p>{/if}
    <button class="btn-primary save-profile" type="submit" disabled={saving}>
      {saving ? "Guardando…" : onboarding ? "Comenzar" : "Guardar cambios"}
    </button>
  </form>
</section>
