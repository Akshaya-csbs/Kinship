package com.kinship.app.services;

import com.kinship.app.interfaces.ITalentSearchable;
import com.kinship.app.models.CreatorUser;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * MULTITHREADING: scores every candidate creator in parallel on a worker pool
 * using {@link Callable} tasks and collects the {@link Future} results.
 */
public class TalentMatchingService {
    public record Match(CreatorUser creator, int score, String matchedBy) {}

    private final ExecutorService pool;

    /** @param pool shared worker pool owned (and shut down) by the server */
    public TalentMatchingService(ExecutorService pool) {
        this.pool = pool;
    }

    /**
     * Ranks candidates by how well their talents complement the viewer (shared talents score highest,
     * then shared location). Runs one task per candidate on the pool.
     */
    public List<Match> recommend(CreatorUser viewer, List<CreatorUser> candidates, int limit) throws InterruptedException {
        List<Callable<Match>> tasks = new ArrayList<>();
        for (CreatorUser candidate : candidates) {
            if (candidate.getId() == viewer.getId()) continue;
            tasks.add(() -> score(viewer, candidate));
        }
        List<Match> results = new ArrayList<>();
        for (Future<Match> future : pool.invokeAll(tasks, 5, TimeUnit.SECONDS)) {
            try {
                if (!future.isCancelled()) {
                    results.add(future.get());
                }
            } catch (ExecutionException e) {
                // a single bad candidate must not break the whole recommendation list
                System.err.println("[TalentMatchingService] " + e.getCause());
            }
        }
        results.sort(Comparator.comparingInt(Match::score).reversed()
                .thenComparing(m -> -m.creator().getFollowers()));
        return results.size() > limit ? results.subList(0, limit) : results;
    }

    private static Match score(ITalentSearchable viewer, CreatorUser candidate) {
        CreatorUser v = (CreatorUser) viewer;
        int talentScore = candidate.getMatchScore(v.getTalents());
        boolean sameCity = v.getLocation() != null && v.getLocation().equalsIgnoreCase(candidate.getLocation());
        int score = Math.min(100, talentScore + (sameCity ? 20 : 0));
        String reason = talentScore > 0 ? "Shares your talents" : sameCity ? "Near you" : "Popular creator";
        if (score == 0) {
            score = Math.min(15, candidate.getFollowers() / 3000);
        }
        return new Match(candidate, score, reason);
    }
}
