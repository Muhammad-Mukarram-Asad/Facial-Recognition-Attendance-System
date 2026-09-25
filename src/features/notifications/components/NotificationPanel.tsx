// 'use client';

// import { useRouter } from 'next/navigation';

// import { Button, Icon, SkeletonRows } from '@/shared/ui';

// import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications';
// import { routeForNotification } from '../lib/routeForKind';
// import type { Notification } from '../types';
// import { ROUTES } from '@/shared/config/routes';

// const PRIORITY_DOT: Record<Notification['priority'], string> = {
//   high: 'var(--priority-high)',
//   medium: 'var(--warning)',
//   low: 'var(--priority-medium)',
// };

// export interface NotificationPanelProps {
//   onClose: () => void;
// }

// export function NotificationPanel({ onClose }: NotificationPanelProps) {
//   const router = useRouter();
//   const { data, isPending } = useNotifications();
//   const markRead = useMarkNotificationRead();
//   const markAllRead = useMarkAllNotificationsRead();

//   const open = (notification: Notification) => {
//     markRead.mutate(notification.id);
//     onClose();
//     router.push(routeForNotification(notification));
//   };

//   return (
//     <div
//       onClick={onClose}
//       style={{
//         position: 'fixed',
//         inset: 0,
//         zIndex: 80,
//         background: 'var(--scrim)',
//         backdropFilter: 'var(--blur-glass)',
//         animation: 'ftFade 140ms var(--ease-out) both',
//       }}
//     >
//       <div
//         role="dialog"
//         aria-label="Notifications"
//         onClick={(event) => event.stopPropagation()}
//         style={{
//           position: 'absolute',
//           top: 78,
//           right: 18,
//           width: 'min(94vw, 392px)',
//           maxHeight: 'min(74vh, 560px)',
//           display: 'flex',
//           flexDirection: 'column',
//           background: 'var(--surface-card)',
//           borderRadius: 18,
//           boxShadow: 'var(--shadow-lg)',
//           overflow: 'hidden',
//           animation: 'ftFadeUp 200ms var(--ease-out) both',
//         }}
//       >
//         <header
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 10,
//             padding: '16px 18px',
//             borderBottom: '1px solid var(--border-subtle)',
//           }}
//         >
//           <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
//             <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>Notifications</span>
//             <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
//               {data?.unreadCount ?? 0} unread · leave, HR and gate alerts
//             </span>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close notifications"
//             style={{
//               width: 34,
//               height: 34,
//               flex: 'none',
//               borderRadius: 11,
//               border: '1px solid var(--border-default)',
//               background: 'var(--surface-card)',
//               color: 'var(--text-muted)',
//               display: 'inline-flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               cursor: 'pointer',
//             }}
//           >
//             <Icon name="x" size={16} />
//           </button>
//         </header>

//         <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
//           {isPending ? (
//             <SkeletonRows rows={5} height={56} />
//           ) : (
//             data?.items.map((notification) => (
//               <button
//                 key={notification.id}
//                 type="button"
//                 onClick={() => open(notification)}
//                 style={{
//                   width: '100%',
//                   display: 'flex',
//                   gap: 12,
//                   padding: '14px 18px',
//                   border: 'none',
//                   borderBottom: '1px solid var(--border-subtle)',
//                   background: 'transparent',
//                   textAlign: 'left',
//                   cursor: 'pointer',
//                 }}
//               >
//                 <span
//                   aria-hidden
//                   style={{
//                     width: 9,
//                     height: 9,
//                     flex: 'none',
//                     marginTop: 6,
//                     borderRadius: '50%',
//                     background: PRIORITY_DOT[notification.priority],
//                   }}
//                 />
//                 <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
//                   <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-strong)' }}>
//                     {notification.title}
//                   </span>
//                   <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--text-muted)' }}>
//                     {notification.body}
//                   </span>
//                   <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
//                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
//                       {notification.time}
//                     </span>
//                     {notification.kind === 'leave' && (
//                       <span
//                         style={{
//                           fontSize: 11,
//                           fontWeight: 700,
//                           letterSpacing: '0.06em',
//                           textTransform: 'uppercase',
//                           color: 'var(--text-accent)',
//                         }}
//                       >
//                         Needs approval
//                       </span>
//                     )}
//                   </span>
//                 </span>
//                 {!notification.read && (
//                   <span
//                     aria-label="Unread"
//                     style={{
//                       width: 7,
//                       height: 7,
//                       flex: 'none',
//                       marginTop: 7,
//                       borderRadius: '50%',
//                       background: 'var(--brand-blue-500)',
//                     }}
//                   />
//                 )}
//               </button>
//             ))
//           )}
//         </div>

//         <footer
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 8,
//             padding: '12px 16px',
//             borderTop: '1px solid var(--border-subtle)',
//             background: 'var(--surface-sunken)',
//           }}
//         >
//           <Button
//             variant="ghost"
//             size="sm"
//             icon="check-check"
//             onClick={() => markAllRead.mutate()}
//             loading={markAllRead.isPending}
//           >
//             Mark all read
//           </Button>
//           <span style={{ flex: 1, minWidth: 0 }} />
//           <Button
//             size="sm"
//             icon="arrow-right"
//             iconPosition="end"
//             onClick={() => {
//               onClose();
//               router.push(ROUTES.leave);
//             }}
//           >
//             Leave queue
//           </Button>
//         </footer>
//       </div>
//     </div>
//   );
// }
