<script lang="ts">
  import type { SellerProfile } from "../domain/models";

  interface Props {
    profile: SellerProfile;
    currency: Intl.NumberFormat;
  }

  let { profile, currency }: Props = $props();
</script>

<section class="page-content" aria-labelledby="profile-title">
  <h2 id="profile-title" class="page-title">Perfil</h2>

  <form action="/submit-form-endpoint" method="POST">
    <div>
      <label for="username">Nombre</label>
      <input
        type="text"
        placeholder="Ingresa tu nombre"
        value={profile.name}
        disabled
      />
    </div>

    <div>
      <label for="monthly-goal">Meta mensual</label>
      <input
        type="number"
        placeholder="Ingresa tu meta mensual"
        value={profile.monthlyGoal}
        disabled
      />
    </div>

    <div>
      <label for="comissionRate">Comision</label>
      <input
        type="number"
        placeholder="Ingresa el porcetanje de tu comision"
        value={profile.commissionRate}
        disabled
      />
    </div>
  </form>

  <dl>
    <div>
      <dt>Nombre</dt>
      <dd>{profile.name}</dd>
    </div>
    <div>
      <dt>Meta mensual</dt>
      <dd>{currency.format(profile.monthlyGoal)}</dd>
    </div>
    <div>
      <dt>Comisión</dt>
      <dd>{(profile.commissionRate * 100).toLocaleString("es-CL")}%</dd>
    </div>
    <div>
      <dt>Horario</dt>
      <dd>{profile.workSchedule.startTime}–{profile.workSchedule.endTime}</dd>
    </div>
  </dl>
</section>
