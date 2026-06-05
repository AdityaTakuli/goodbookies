import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  getVenueReviewSummary,
  listVenueReviews,
  getMyVenueReviewState,
  submitVenueReview,
} from "@/lib/review.functions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function StarRow({
  value,
  size = "sm",
  interactive = false,
  onChange,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (n: number) => void;
}) {
  const sizeClass = size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const [hover, setHover] = useState(0);
  const display = interactive ? hover || value : value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= display ? "fill-primary text-primary" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VenueReviews({ venueId, venueName }: { venueId: string; venueName: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const summaryFn = useServerFn(getVenueReviewSummary);
  const listFn = useServerFn(listVenueReviews);
  const stateFn = useServerFn(getMyVenueReviewState);
  const submitFn = useServerFn(submitVenueReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: summary } = useQuery({
    queryKey: ["venue-review-summary", venueId],
    queryFn: () => summaryFn({ data: { venueId } }),
  });

  const { data: reviews } = useQuery({
    queryKey: ["venue-reviews", venueId],
    queryFn: () => listFn({ data: { venueId, limit: 20 } }),
  });

  const { data: myState } = useQuery({
    queryKey: ["my-venue-review", venueId],
    queryFn: () => stateFn({ data: { venueId } }),
    enabled: Boolean(user),
  });

  const total = summary?.totalReviews ?? 0;
  const avg = summary?.averageRating;
  const distribution = summary?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["venue-review-summary", venueId] });
    qc.invalidateQueries({ queryKey: ["venue-reviews", venueId] });
    qc.invalidateQueries({ queryKey: ["my-venue-review", venueId] });
    qc.invalidateQueries({ queryKey: ["venue", venueId] });
  };

  const openForm = () => {
    if (myState?.myReview) {
      setRating(myState.myReview.rating);
      setComment(myState.myReview.comment);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters of feedback");
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({ data: { venueId, rating, comment: comment.trim() } });
      toast.success(myState?.myReview ? "Review updated" : "Thanks for your review!");
      setShowForm(false);
      invalidate();
    } catch (e: any) {
      toast.error(e.message ?? "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mt-10 scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            Reviews
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Player feedback for {venueName} — like Google reviews for turfs
          </p>
        </div>
        {user && myState?.canReview && (
          <Button variant="outline" size="sm" onClick={openForm}>
            {myState.myReview ? "Edit your review" : "Write a review"}
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-xl border border-border/60 bg-background/50 p-4 text-center">
          <p className="font-display text-5xl font-bold">
            {avg != null ? avg.toFixed(1) : "—"}
          </p>
          <StarRow value={Math.round(avg ?? 0)} size="md" />
          <p className="mt-2 text-sm text-muted-foreground">
            {total} review{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-muted-foreground">{star}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {user && !myState?.canReview && !myState?.myReview && (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          Book and play here first — then you can leave a review for this turf.
        </p>
      )}

      {showForm && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <p className="font-semibold">{myState?.myReview ? "Update your review" : "Share your experience"}</p>
          <div className="mt-3">
            <p className="mb-2 text-sm text-muted-foreground">Your rating</p>
            <StarRow value={rating} size="lg" interactive onChange={setRating} />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted-foreground">Your feedback</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the pitch, facilities, staff, and value for money?"
              rows={4}
              maxLength={2000}
            />
            <p className="mt-1 text-xs text-muted-foreground">{comment.length}/2000 · min 10 characters</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving…" : myState?.myReview ? "Update review" : "Post review"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {(reviews ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share feedback after you play.</p>
        ) : (
          reviews!.map((review) => (
            <article key={review.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{review.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatReviewDate(review.createdAt)}
                    {review.isEdited ? " · edited" : ""}
                  </p>
                </div>
                <StarRow value={review.rating} size="sm" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{review.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
