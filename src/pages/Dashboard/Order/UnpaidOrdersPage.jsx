import { StaffOrdersPageContent } from "./StaffOrdersPage";

const UnpaidOrdersPage = () => (
  <StaffOrdersPageContent
    unpaidOnly
    title="Unpaid orders"
    subtitle="Abandoned checkout orders (7+ days, purchase only) — safe to delete when no payment is pending"
  />
);

export default UnpaidOrdersPage;
