const slugifyArtistName = (artistName: string) =>
	artistName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

export const buildArtistProfileHref = (artistName: string) => {
	const slug = slugifyArtistName(artistName) || "artist";
	const params = new URLSearchParams();
	params.set("name", artistName);

	return `/artists/${encodeURIComponent(slug)}?${params.toString()}`;
};

export const getArtistNameFromProfileParams = (artistSlug: string, searchParams: URLSearchParams) => {
	const explicitName = searchParams.get("name")?.trim();
	if (explicitName) {
		return explicitName;
	}

	return artistSlug
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};
