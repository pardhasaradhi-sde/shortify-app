package com.example.url_shortener.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShortUrlDTORequest {

    @NotBlank(message = "URL must not be blank")
    @URL(message = "Must be a valid URL (e.g. https://example.com)")
    @Size(max = 2048, message = "URL must be 2048 characters or fewer")
    private String originalUrl;

    /**
     * Optional: user-specified alias (e.g. "my-portfolio"). Null = auto-generate.
     */
    @Size(max = 20, message = "Custom alias must be 20 characters or fewer")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Custom alias can only contain lowercase letters, numbers, and hyphens")
    private String customAlias;
}
