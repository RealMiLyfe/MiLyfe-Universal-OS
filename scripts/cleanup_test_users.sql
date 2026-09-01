-- Delete all data + auth rows for the 3 leftover test users. NEVER touches mi@milyfe.fun.
DO $$
DECLARE
  tid UUID;
  test_ids UUID[] := ARRAY[
    '91d92ad8-784e-45c7-9298-f0b997710682',
    'a64f6da4-a1e2-4e9a-b5a1-ea7ece9b1e84',
    'c107e2de-f6ba-4d06-972f-c1eec0d451cc'
  ]::UUID[];
BEGIN
  FOREACH tid IN ARRAY test_ids LOOP
    -- children first
    DELETE FROM public.votes WHERE user_id = tid;
    DELETE FROM public.proposal_comments WHERE author_id = tid;
    DELETE FROM public.proposals WHERE author_id = tid;
    DELETE FROM public.forum_replies WHERE author_id = tid;
    DELETE FROM public.forum_posts WHERE author_id = tid;
    DELETE FROM public.quest_claims WHERE claimer_id = tid;
    DELETE FROM public.quests WHERE creator_id = tid;
    DELETE FROM public.marketplace_listings WHERE seller_id = tid;
    DELETE FROM public.surplus_items WHERE donor_id = tid;
    DELETE FROM public.messages WHERE sender_id = tid OR receiver_id = tid;
    DELETE FROM public.connections WHERE requester_id = tid OR addressee_id = tid;
    DELETE FROM public.health_checkins WHERE user_id = tid;
    DELETE FROM public.safety_contacts WHERE user_id = tid;
    DELETE FROM public.safety_actions WHERE user_id = tid;
    DELETE FROM public.safety_journal WHERE user_id = tid;
    DELETE FROM public.notifications WHERE user_id = tid;
    DELETE FROM public.rewards WHERE user_id = tid;
    DELETE FROM public.transactions WHERE from_user_id = tid OR to_user_id = tid;
    DELETE FROM public.learn_enrollments WHERE user_id = tid;
    DELETE FROM public.learn_badges WHERE user_id = tid;
    DELETE FROM public.attestations WHERE from_user_id = tid OR to_user_id = tid;
    DELETE FROM public.standing WHERE user_id = tid;
    DELETE FROM public.wallets WHERE user_id = tid;
    DELETE FROM public.delegations WHERE delegator_id = tid OR delegate_id = tid;
    DELETE FROM public.profiles WHERE id = tid;
    -- auth identities then user
    DELETE FROM auth.identities WHERE user_id = tid;
    DELETE FROM auth.sessions WHERE user_id = tid;
    DELETE FROM auth.users WHERE id = tid;
  END LOOP;
END $$;
