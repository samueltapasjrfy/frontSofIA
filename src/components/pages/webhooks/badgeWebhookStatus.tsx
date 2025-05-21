import { Badge } from "@/components/ui/badge";
import { WEBHOOK_STATUS } from "@/constants/webhook";

export default function BadgeWebhookStatus({ idStatus, status }: { idStatus: number, status: string }) {
    return (
        <Badge variant={
            idStatus === WEBHOOK_STATUS.SUCCESS ? 'success'
                : idStatus === WEBHOOK_STATUS.ERROR ? 'error'
                    : 'pending'
        }>
            {status}
        </Badge>
    )
}