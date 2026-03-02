import SubscriptionTable from '../../components/tables/SubscriptionTableOne'

interface SubscriptionProps {
  allowedRoles?: string[];
}

const Subscription: React.FC<SubscriptionProps> = ({ allowedRoles }) => {
  return (
    <div>
      <SubscriptionTable allowedRoles={allowedRoles} />
    </div>
  )
}

export default Subscription