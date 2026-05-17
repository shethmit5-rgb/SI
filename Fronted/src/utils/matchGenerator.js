const Match = require("../models/Match");

async function generateMatches(tournament) {
  const teams = tournament.teams;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      await Match.create({
        tournamentId: tournament._id,
        teams: [teams[i], teams[j]],
        matchDate: tournament.startDate,
        venueId: tournament.venueId,
        status: "scheduled",
      });
    }
  }
}

module.exports = generateMatches;

